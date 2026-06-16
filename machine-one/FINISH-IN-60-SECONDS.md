# Historical Reference — Old Setup Guide

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current routing, reply behavior, or operations.

The whole system is built and **already running** as a self-healing daemon:

```
supervisor (run.sh)
 ├─ next dev      → serves openaitpm pages on :3001
 ├─ cloudflared   → public URL: https://denmark-passive-bidder-pin.trycloudflare.com
 └─ agent-loop    → watches inbound texts → Claude builds page → texts back the URL
```

The agent is polling right now and printing:
`[blocked] chat.db read denied — grant Full Disk Access. Retrying…`

That is the ONE remaining step. It's a macOS **security** setting, so only you can flip it.

## Do this (the pane is already open on your screen)

1. The window is **System Settings → Privacy & Security → Full Disk Access**.
2. Click the **+** button.
3. Add **whichever app is running Claude Code** (the one you're typing in — likely **Claude** or **Terminal**). To be safe you can add both.
   - If you'd rather grant the exact binaries: press **Cmd+Shift+G** in the file picker and add
     `/opt/homebrew/bin/imsg` and `/opt/homebrew/bin/node`.
4. Toggle it **ON**. If macOS asks to quit & reopen the app, do it.

That's it. Within ~4 seconds the agent picks up access and the log flips to:
`[start] agent-loop … allow=anyone` (no more "blocked" lines).

## Test it

Text **any idea** to **+1 (949) 508-9229** (or the +1 (484) 326-0020 thread).
You'll get back: `Your idea is live: https://…/your-idea` within ~10 seconds.

## Live right now (no FDA needed to view)

- https://denmark-passive-bidder-pin.trycloudflare.com/  (gallery)
- https://denmark-passive-bidder-pin.trycloudflare.com/oncall-review-buddy
- https://denmark-passive-bidder-pin.trycloudflare.com/calculator-explains-every-step
- https://denmark-passive-bidder-pin.trycloudflare.com/a-meal-planner-that-builds-a-grocery-list-from-your-week
- https://denmark-passive-bidder-pin.trycloudflare.com/a-personal-crm-that-reminds-you-to-follow-up-with-friends

## Two things I genuinely couldn't do (no workaround on my side)

- **Push to GitHub** — there's no GitHub token/SSH key/`gh` on this Mac, so `git push` has nothing to authenticate with. Once you run `gh auth login` or add a token, the agent auto-commits + pushes every idea (code already handles it).
- **Real openaitpm.com domain** — it doesn't resolve anywhere (not registered / no DNS). Until then, the cloudflared URL above is the public surface. Point the domain at Vercel and swap `OPENAITPM_BASE_URL` to flip everything to openaitpm.com.

## Make it permanent (optional, survives reboot)

```
cp "/Users/machine1/Documents/openaitpm-sms/com.openaitpm.agent.plist" ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.openaitpm.agent.plist
```
(The launchd job also needs the same Full Disk Access grant.)
