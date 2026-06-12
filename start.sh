#!/bin/bash
# Kill anything on 3009 before starting
fuser -k 3009/tcp 2>/dev/null || true
sleep 1
exec node_modules/.bin/next start --port 3009
