#!/usr/bin/env bash
# One-shot setup: prompt for creds → write .env → install → test generation → print deploy command.
# Run from the project root:  ./setup.sh
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo
echo "═══════════════════════════════════════════════════════"
echo "  openaitpm-sms — interactive setup"
echo "═══════════════════════════════════════════════════════"
echo
echo "I'll ask for a few credentials. Leave optional ones blank."
echo "Nothing leaves your machine. Values go into .env (gitignored)."
echo

read -rsp "Anthropic API key (sk-ant-...) [required]: " ANTHROPIC_KEY
echo
if [[ -z "$ANTHROPIC_KEY" ]]; then
  echo "  ✗ Anthropic key is required. Get one at https://console.anthropic.com/settings/keys"
  exit 1
fi

read -rp "Twilio Account SID (AC...) [optional now, required for SMS]: " TWILIO_SID
read -rsp "Twilio Auth Token [optional now]: " TWILIO_TOKEN
echo
read -rp "Gmail App Password for machine005@gmail.com [optional]: " GMAIL_PW

PUBLIC_URL="${PUBLIC_URL:-https://openaitpm.com}"

cat > .env <<EOF
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
TWILIO_ACCOUNT_SID=$TWILIO_SID
TWILIO_AUTH_TOKEN=$TWILIO_TOKEN
TWILIO_PHONE_NUMBER=+19495089229
PUBLIC_BASE_URL=$PUBLIC_URL
GMAIL_USER=machine005@gmail.com
GMAIL_APP_PASSWORD=$GMAIL_PW
GMAIL_NOTIFY_TO=machine005@gmail.com
PORT=3000
CLAUDE_MODEL=claude-sonnet-4-6
EOF
echo "  ✔ wrote .env"

echo
echo "Installing dependencies..."
npm install --silent

echo
echo "Running a real Claude generation as a smoke test..."
echo
node src/cli-test.js "a pomodoro timer that tracks deep work blocks across the day"

echo
echo "═══════════════════════════════════════════════════════"
echo "  Local pipeline works. Next:"
echo "═══════════════════════════════════════════════════════"
echo
echo "  1. Boot the server:           npm start"
echo "     Open:                      http://localhost:3000"
echo
echo "  2. Deploy to Railway:         npm i -g @railway/cli && railway login && railway init && railway up"
echo "     Then paste the same env vars into Railway dashboard."
echo
echo "  3. Point Twilio webhook:      https://console.twilio.com  →  +19495089229  →  smsUrl = <deploy>/webhook/sms"
echo
echo "  4. Test from your phone:      text any idea to +1 (949) 508-9229"
echo
echo "Full walkthrough: DEPLOY.md"
echo
