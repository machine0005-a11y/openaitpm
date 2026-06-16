#!/bin/bash
# ideamuses supervisor: keeps the receive→build loop alive on machine one.
#
#   reader.sh   — runs INSIDE Terminal (which has Full Disk Access) so imsg can
#                 read chat.db; dumps inbox + chat map to /tmp.
#   agent-loop  — watches the inbox, and for every NEW inbound text builds an
#                 ideamuses.com/<idea> page (dynamic production route) and
#                 texts the URL back from machine one (+19495089229).
#
# Vercel serves ideamuses.com, so no local dev server / tunnel is needed.
# This script is idempotent: it (re)starts whatever has died, every 20s.
set -u

SMS_DIR="/Users/machine1/Documents/openaitpm-sms"
AGENT_LOG=/tmp/openaitpm-agent.log
READER_LOG=/tmp/openaitpm-reader.log
INBOX=/tmp/openaitpm-inbox.json
IMSG=/opt/homebrew/bin/imsg
BASE_URL="https://www.ideamuses.com"
OWNER_NUMBER="${OWNER_NUMBER:-+14843260020}"
RUN_LOG=/tmp/ideamuses-runs.jsonl
STALE_ALERTED=0
# ALLOW_FROM empty = accept a text from ANYONE. Set to a comma list to restrict.
ALLOW_FROM="${ALLOW_FROM:-}"
# launchd does not automatically expose user-session variables to this
# supervisor, so explicitly inherit the image-generation key when available.
OPENAI_API_KEY="${OPENAI_API_KEY:-$(launchctl getenv OPENAI_API_KEY 2>/dev/null || true)}"

log(){ echo "$(date -u +%FT%TZ) [sup] $*"; }
record_restart(){ printf '{"timestamp":"%s","status":"supervisor-restart","component":"%s"}\n' "$(date -u +%FT%TZ)" "$1" >> "$RUN_LOG"; }
alert_owner(){ "$IMSG" send --to "$OWNER_NUMBER" --text "Machine One blocker — $1" --service imessage --json >/dev/null 2>&1 || true; }

# The reader MUST be a child of Terminal.app to inherit Full Disk Access.
# We detect "is a reader running" by process name; if not, ask Terminal to start one.
start_reader(){
  if ! pgrep -f "reader.sh" >/dev/null 2>&1; then
    log "starting reader.sh inside Terminal (for FDA)"
    record_restart "SMS reader"
    osascript -e 'tell application "Terminal" to do script "bash /Users/machine1/Documents/openaitpm-sms/reader.sh"' >/dev/null 2>&1
    sleep 5
  fi
}

start_agent(){
  # Refactored entrypoint: src/agent.mjs (modular). Matches either name in pgrep
  # so an already-running old agent isn't double-spawned during the swap.
  if ! pgrep -f "src/agent.mjs" >/dev/null 2>&1; then
    log "starting agent base=$BASE_URL allow=${ALLOW_FROM:-anyone}"
    record_restart "Machine One orchestrator"
    ( cd "$SMS_DIR" && ALLOW_FROM="$ALLOW_FROM" OPENAITPM_BASE_URL="$BASE_URL" \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        nohup node src/agent.mjs >"$AGENT_LOG" 2>&1 & )
    sleep 3
  fi
}

# Health: warn if the inbox file goes stale (reader stuck / FDA revoked).
check_inbox(){
  if [ -f "$INBOX" ]; then
    now=$(date +%s); m=$(stat -f %m "$INBOX" 2>/dev/null || echo 0)
    age=$(( now - m ))
    if [ "$age" -gt 60 ]; then
      log "WARN inbox stale ${age}s — reader may be stuck"
      if [ "$STALE_ALERTED" -eq 0 ]; then
        alert_owner "SMS reader: inbox stale ${age}s"
        STALE_ALERTED=1
      fi
    else
      STALE_ALERTED=0
    fi
  fi
}

log "supervisor up (machine one number +19495089229 → ideamuses.com/<idea>)"
while true; do
  start_reader
  start_agent
  check_inbox
  sleep 20
done
