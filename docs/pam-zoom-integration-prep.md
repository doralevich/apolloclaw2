# Pam Fox / Taylor Hamilton Zoom Integration Prep

## Vercel environment variables

Add these in Vercel:

Project: `designsbydaveo/apolloclaw2`
Path: Settings → Environment Variables
Environments: Production, Preview, Development unless David wants production-only.

Required values from Karla:

```text
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_REDIRECT_URI=https://www.apolloclaw.ai/pam/zoom/callback
ZOOM_WEBHOOK_SECRET_TOKEN=
```

Do not add fake values. `ZOOM_REDIRECT_URI` is the only value we already know.

## Authorization URL generator

Once `ZOOM_CLIENT_ID` is available:

```bash
ZOOM_CLIENT_ID=<ZOOM_CLIENT_ID> node scripts/generate-pam-zoom-auth-url.mjs
```

Expected format:

```text
https://zoom.us/oauth/authorize?response_type=code&client_id=<ZOOM_CLIENT_ID>&redirect_uri=https%3A%2F%2Fwww.apolloclaw.ai%2Fpam%2Fzoom%2Fcallback
```

Do not send this link to Taylor or Karla until the Vercel env vars are added, deployment is refreshed, and the callback/webhook checks pass.

## Supabase transcript storage

Private bucket: `zoom-integrations`

Paths:

```text
pam/tokens.json
pam/transcripts/<timestamp>-<meeting>.metadata.json
pam/transcripts/<timestamp>-<meeting>.vtt
pam/events/<timestamp>-<meeting>.event.json
```

Each transcript metadata JSON is saved in this shape:

```json
{
  "source": "zoom",
  "event_type": "meeting_transcript_ready",
  "meeting_id": "",
  "meeting_uuid": "",
  "topic": "",
  "start_time": "",
  "duration_minutes": "",
  "host_email": "",
  "participants": [],
  "recording_url": "",
  "transcript_text": "",
  "transcript_format": "vtt",
  "received_at": ""
}
```

## Test checklist once Karla sends credentials

1. Add Zoom credentials to Vercel.
2. Redeploy Vercel production.
3. Confirm callback is still live:
   ```bash
   curl -i https://www.apolloclaw.ai/pam/zoom/callback
   ```
   Expected body: `Missing Zoom authorization code.`
4. Confirm webhook validation:
   ```bash
   curl -i -X POST https://www.apolloclaw.ai/pam/zoom/webhook \
     -H 'content-type: application/json' \
     --data '{"event":"endpoint.url_validation","payload":{"plainToken":"test_plain_token"}}'
   ```
   Expected: JSON with `plainToken` and HMAC `encryptedToken`.
5. Generate the Zoom authorization URL:
   ```bash
   ZOOM_CLIENT_ID=<ZOOM_CLIENT_ID> node scripts/generate-pam-zoom-auth-url.mjs
   ```
6. Send authorization URL to Taylor or the Zoom admin.
7. Authorize the app.
8. Run one short cloud-recorded Zoom meeting.
9. Wait for Zoom transcript processing.
10. Confirm Zoom sends the webhook.
11. Confirm transcript metadata and VTT are saved in Supabase private bucket `zoom-integrations`.
12. Confirm transcript can be forwarded to Pam/Hermes.


## Hardened first transcript test behavior

Implemented safeguards before the first transcript test:

- Access tokens are checked before Zoom API calls.
- Tokens refresh when expired or within five minutes of expiring.
- Refresh uses `POST https://zoom.us/oauth/token` with Basic Auth and `grant_type=refresh_token`.
- Refreshed tokens overwrite `pam/tokens.json` in the private Supabase bucket.
- Webhook raw events are saved under `pam/events/`.
- Safe failures are saved under `pam/events/errors/` with timestamp, event type, meeting ID or UUID when available, failed step, and redacted error message.
- Transcript files are selected from `recording_files` by preferring `file_type=TRANSCRIPT` or `file_extension=VTT`.
- Transcript VTT and the Pam/Hermes handoff metadata payload are saved under `pam/transcripts/`.
- Zoom recording readiness target: `recording.completed`, with broader recording event handling as fallback.

Protected status check:

```text
GET /pam/zoom/status
Header: x-zoom-status-token: <ZOOM_STATUS_TOKEN>
```

Add this Vercel environment variable before using the status endpoint:

```text
ZOOM_STATUS_TOKEN=<long random internal token>
```

The status endpoint reports env presence, storage folder/file presence, token presence, token age/expiry status, and scopes without returning access tokens, refresh tokens, client secrets, or webhook secrets.
