#!/bin/bash
# reader.sh — MUST run inside Terminal.app (which has Full Disk Access) so that
# `imsg` AND `sqlite3` can read chat.db. Dumps recent inbound messages to a JSON
# file the Node agent consumes, PLUS an attachments map (message rowid -> media
# files) so the agent can build pages from images / videos / voice / voicemail.
#
# Launch it via:
#   osascript -e 'tell application "Terminal" to do script "bash /Users/machine1/Documents/openaitpm-sms/reader.sh"'
IMSG=/opt/homebrew/bin/imsg
DB="$HOME/Library/Messages/chat.db"
OUT=/tmp/openaitpm-inbox.json
TMP=/tmp/openaitpm-inbox.tmp
ATT=/tmp/openaitpm-attachments.json
ATT_TMP=/tmp/openaitpm-attachments.tmp
LOG=/tmp/openaitpm-reader.log

echo "$(date -u +%FT%TZ) [reader] starting (FDA via Terminal, media-enabled)" >> "$LOG"

# (attachment SQL is inlined in the loop below for robustness.)

while true; do
  : > "$TMP"

  # --- attachments FIRST (fast, direct sqlite) so the slow imsg-history loop
  # below can never starve it. Writes {rowid, mime, uti, name, path}. ---
  # Write sqlite output straight to a temp file (never compare the multi-KB
  # JSON inside a `[ ... ]` test — that hangs/fails on the embedded brackets).
  # Use sed to swap the home placeholder. Empty/null/[] all become a valid [].
  /usr/bin/sqlite3 "$DB" "SELECT json_group_array(json_object('rowid', m.ROWID, 'mime', a.mime_type, 'uti', a.uti, 'name', a.transfer_name, 'path', REPLACE(a.filename,'~','HOMEPLACEHOLDER'))) FROM message m JOIN message_attachment_join maj ON maj.message_id=m.ROWID JOIN attachment a ON a.ROWID=maj.attachment_id WHERE m.is_from_me=0 AND a.filename IS NOT NULL ORDER BY m.ROWID DESC LIMIT 60;" 2>>"$LOG" \
    | sed "s|HOMEPLACEHOLDER|$HOME|g" > "$ATT_TMP"
  if [ -s "$ATT_TMP" ] && [ "$(head -c 4 "$ATT_TMP")" != "null" ]; then
    mv "$ATT_TMP" "$ATT" 2>/dev/null
  else
    printf '[]' > "$ATT"
  fi

  # --- inbox text via imsg (slower) ---
  CHATS=$("$IMSG" chats --limit 25 --json 2>>"$LOG")
  if [ -z "$CHATS" ]; then
    echo "$(date -u +%FT%TZ) [reader] no chats / denied" >> "$LOG"
    sleep 3; continue
  fi
  printf '%s\n' "$CHATS" > /tmp/openaitpm-chats.json
  echo "$CHATS" | grep -oE '"id":[0-9]+' | sed 's/"id"://' | sort -u | while read -r cid; do
    [ -z "$cid" ] && continue
    "$IMSG" history --chat-id "$cid" --limit 8 --json 2>>"$LOG" >> "$TMP"
  done
  mv "$TMP" "$OUT" 2>/dev/null

  sleep 3
done
