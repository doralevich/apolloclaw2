#!/usr/bin/env bash
# Build and push the College Agent's box, then register (or update) it on Agent37 as the
# workspace template `apollo-college`.
#
# Needs, on the machine running it:
#   - docker with buildx, logged in to ghcr.io (pull ghcr.io/agent37-platform/*, push
#     ghcr.io/apolloclawplatform/*)
#   - AGENT37_API_KEY in the repo's .env.local, or in the environment
#
# Tags are immutable: YYYY.MM.DD plus a letter (a, b, c...). Bump TAG below, or pass it inline:
#
#   TAG=2026.11.06a ./template/college/release.sh
#   BASE_TAG=2026.11.01a TAG=2026.11.06b ./template/college/release.sh   # pin an older base
#
# Existing instances keep the tag they were created with. A student's agent picks up a newer
# image only when it is reprovisioned.
#
# Until this has run once, config/agent-types.ts provisions the college agent from the stock
# `agent37-openclaw` template through its alias, which is the same box without Claude Code.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # template/college
ROOT="$(cd "${DIR}/../.." && pwd)"                    # repo root (holds .env.local)

read_env() {
  local v
  v="$(grep -E "^$1=." "${ROOT}/.env.local" 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\r')"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  printf '%s' "$v"
}

# The base image: Agent37's stock OpenClaw. The registry is the source of truth for its newest
# date tag, so resolve it there rather than trusting a moving :latest.
BASE_REPO="${BASE_REPO:-agent37-platform/openclaw}"

resolve_base_tag() {
  local token
  token="$(curl -fsSL "https://ghcr.io/token?scope=repository:${BASE_REPO}:pull" \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)" || return 1
  [ -n "$token" ] || return 1
  curl -fsSL -H "Authorization: Bearer ${token}" \
    "https://ghcr.io/v2/${BASE_REPO}/tags/list" \
    | grep -oE '"[0-9]{4}\.[0-9]{2}\.[0-9]{2}[a-z]*"' \
    | tr -d '"' | LC_ALL=C sort | tail -1
}

AGENT37_API_KEY="${AGENT37_API_KEY:-$(read_env AGENT37_API_KEY)}"
: "${AGENT37_API_KEY:?not found - set AGENT37_API_KEY in .env.local or the environment}"

IMAGE="${IMAGE:-ghcr.io/apolloclawplatform/apollo-college}"
TAG="${TAG:-2026.11.05a}"
NAME="${TEMPLATE_NAME:-apollo-college}"
BASE_TAG="${BASE_TAG:-$(resolve_base_tag || true)}"
: "${BASE_TAG:?could not resolve a base tag from GHCR for ${BASE_REPO} - set BASE_TAG explicitly, or BASE_REPO if the OpenClaw image lives under another name}"

API="${AGENT37_API:-$(read_env AGENT37_API_BASE_URL)}"; API="${API:-https://api.agent37.com/v1}"
AUTH="Authorization: Bearer ${AGENT37_API_KEY}"

echo "==> Build + push ${IMAGE}:${TAG} (linux/amd64)"
echo "    base: ghcr.io/${BASE_REPO}:${BASE_TAG}"
docker buildx build --platform linux/amd64 --pull \
  --build-arg "BASE_REPO=${BASE_REPO}" \
  --build-arg "BASE_TAG=${BASE_TAG}" \
  -t "${IMAGE}:${TAG}" --push "${DIR}"

# No ports declared on the template: the stock OpenClaw gateway is what the bare instance URL
# routes to, and every other surface is reachable at {id}-{port}.agent37.app. default_port is
# sent as null so a re-run always clears any earlier value (PATCH is partial).
BODY=$(cat <<JSON
{
  "name": "${NAME}",
  "image_ref": "${IMAGE}:${TAG}",
  "description": "The College Agent - OpenClaw plus Claude Code.",
  "default_port": null
}
JSON
)

# Create the template the first time, update it (same name) on every release after.
if [ "$(curl -sS -o /dev/null -w '%{http_code}' -H "${AUTH}" "${API}/templates/${NAME}" || true)" = "200" ]; then
  echo "==> Update template ${NAME} (PATCH)"; method=PATCH; url="${API}/templates/${NAME}"
else
  echo "==> Create template ${NAME} (POST)"; method=POST; url="${API}/templates"
fi

out="$(mktemp)"
code=$(curl -sS -o "${out}" -w '%{http_code}' \
  -X "${method}" "${url}" -H "${AUTH}" -H "Content-Type: application/json" -d "${BODY}")
echo "HTTP ${code}"; cat "${out}" 2>/dev/null || true; echo
rm -f "${out}"
case "${code}" in 2*) echo "OK  ${NAME} -> ${IMAGE}:${TAG}";; *) echo "FAILED"; exit 1;; esac
