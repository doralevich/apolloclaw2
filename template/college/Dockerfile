# The College Agent's box: the stock OpenClaw image every ApolloClaw agent runs on, plus the
# Claude Code CLI preinstalled.
#
# WHY A CUSTOM IMAGE AT ALL. Every other agent here is a plain OpenClaw box plus the files we
# generate (config/personas.ts, lib/agent-files.ts), and that is the point of the design: the
# image carries nothing about the product. The college agent keeps one thing from its old
# Hermes-based image (thecollegeagent.ai, template/Dockerfile there): a student can open the
# terminal on their agent, type `claude`, sign in with their own Anthropic account, and use
# Claude Code on their own files (David, Nov 5 2026: "I like to have it"). Building that onto
# the stock box rather than keeping the Hermes one means provisioning, the file layout and the
# dashboard all work exactly as they do for every other agent.
#
# Published to ghcr.io/apolloclawplatform/apollo-college and registered on Agent37 as the
# workspace template `apollo-college` (release.sh). Referenced by config/agent-types.ts
# (the college type's `template`) and config/agents.ts (ports and runtime).
#
# THE BASE. Agent37's stock OpenClaw template is `agent37-openclaw`. Its image lives under the
# same GHCR organisation as the Hermes base the college image was built from
# (ghcr.io/agent37-platform/hermes), and release.sh resolves the newest date tag from the
# registry the same way that script did. If the registry names the OpenClaw image differently,
# BASE_REPO on release.sh is the one line to change. The base is private on GHCR, so the build
# needs pull credentials (`docker login ghcr.io`); the pushed image bakes its layers and is
# self-contained.
ARG BASE_REPO=agent37-platform/openclaw
ARG BASE_TAG=latest
FROM ghcr.io/${BASE_REPO}:${BASE_TAG}

USER root

# The Claude Code CLI. Installed under /usr/local, NOT the default npm global prefix in the
# runtime user's home, because /home/node is a persisted volume at runtime that masks whatever
# the image put there; /usr/local survives. Lands at /usr/local/bin/claude.
#
# Preinstalled but UNAUTHENTICATED, bring-your-own sign-in: the student runs `claude` in the
# terminal and signs in. No API key is baked in. A student has full terminal and file access
# to their own box, so a baked key would be readable and uncapped.
ARG CLAUDE_CODE_VERSION=latest
RUN NPM_CONFIG_PREFIX=/usr/local npm install -g \
      "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
  && command -v claude >/dev/null \
  && npm cache clean --force

# Stock OpenClaw ports, documentation only: the platform routes every container port at
# {id}-{port}.agent37.app. Gateway and Control UI, terminal, file browser. These are the
# numbers config/agents.ts opens for `agent37-openclaw`, and `apollo-college` maps to the same.
EXPOSE 18789 7681 8080

USER node
