#!/usr/bin/env bash
# Post-deploy verifier. Run AFTER you've deployed and pointed DNS.
#   ./verify.sh https://openaitpm.com
# Or against a Railway preview URL:
#   ./verify.sh https://openaitpm-sms-production.up.railway.app

set -u
BASE="${1:-https://openaitpm.com}"
BASE="${BASE%/}"

pass=0; fail=0
ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; pass=$((pass+1)); }
bad()  { printf "  \033[31m✗\033[0m %s\n" "$1"; fail=$((fail+1)); }
hdr()  { printf "\n\033[1m%s\033[0m\n" "$1"; }

hdr "Checking $BASE"

# 1. Health
out=$(curl -sfm 10 "$BASE/health" 2>&1) && [[ "$out" == *'"ok":true'* ]] \
  && ok "/health responds with ok:true" \
  || bad "/health failed: $out"

# 2. Landing
code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$BASE/")
[[ "$code" == "200" ]] && ok "/ returns 200" || bad "/ returned $code"

# 3. Landing has the phone number visible
curl -sfm 10 "$BASE/" | grep -q '949.*508.*9229' \
  && ok "landing page shows +1 (949) 508-9229" \
  || bad "landing page missing phone number"

# 4. Gallery
code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$BASE/sites")
[[ "$code" == "200" ]] && ok "/sites (gallery) returns 200" || bad "/sites returned $code"

# 5. A seeded prototype renders
for slug in habit-tracker-streaks flashcard-app-sat-vocab-spaced-repetition recipe-finder-only-ingredients-have focus-timer-ambient-sound-time-day; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$BASE/$slug")
  [[ "$code" == "200" ]] && ok "/$slug returns 200" || bad "/$slug returned $code"
done

# 6. 404 page for unknown slug
code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$BASE/this-slug-should-not-exist-xyz")
[[ "$code" == "404" ]] && ok "/<unknown> returns 404" || bad "/<unknown> returned $code (expected 404)"

# 7. Webhook endpoint exists (rejects GET with 404 because route is POST-only)
code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "$BASE/webhook/sms")
[[ "$code" == "404" ]] && ok "/webhook/sms exists (GET correctly 404s POST-only route)" || bad "/webhook/sms returned $code"

# 8. HTTPS works
[[ "$BASE" == https://* ]] && ok "using HTTPS" || bad "not using HTTPS — TLS not provisioned"

hdr "Result"
echo "  $pass passed, $fail failed"
echo
if [[ "$fail" -eq 0 ]]; then
  cat <<EOF
✅  Deploy looks healthy.

Final live test (requires a phone):
  Text any idea to +1 (949) 508-9229
  → One reply only (target under 60s): "$BASE/<slug>"
  → That URL renders a working prototype
EOF
  exit 0
else
  cat <<EOF
❌  Some checks failed. Common causes:
  - DNS hasn't propagated yet  → dig $BASE | head -5
  - Railway env vars not set   → Railway dashboard → Variables
  - Volume not mounted at /app/sites → /sites and /<slug> would 500
  - SSL not issued yet         → wait a few minutes, retry
EOF
  exit 1
fi
