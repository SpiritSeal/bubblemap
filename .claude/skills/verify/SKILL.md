---
name: verify
description: Build, launch, and drive bubblemap locally to verify UI changes end-to-end with Playwright screenshots.
---

# Verifying bubblemap changes in the running app

## Environment gotchas (do these first)

- The default shell is Node 16: `source ~/.nvm/nvm.sh && nvm use 24` before
  any npm/npx/firebase command.
- Emulators need JDK 21: `export JAVA_HOME=/opt/homebrew/opt/openjdk@21;
  export PATH="$JAVA_HOME/bin:$PATH"`.
- Never start the hosting emulator locally — macOS ControlCenter squats
  port 5000. Always pass `--only`.

## Launch (two background processes)

```bash
npx firebase-tools emulators:start --only firestore,auth -P testing
BROWSER=none npx vite --port 5173 --strictPort
```

Add `functions` to `--only` (and build ./functions first) if the flow under
test calls the suggestion backend; otherwise the canvas logs
`internal` / connection-refused errors on 5001 that are environment noise,
not bugs.

Ready when `curl localhost:9099` returns 200 and `curl localhost:5173`
returns the HTML shell. Dev mode (`MODE !== 'production'`) auto-connects to
the emulators and skips App Check.

## Drive

Playwright works well (install once: `npx playwright install chromium`;
`npm i playwright` in a scratch dir, not the repo). Useful flows:

- Signed-out home: fresh context → `/` → h1 "Bubble Map", primary CTA
  "Create Your First MindMap".
- Full CTA flow: click the CTA → anonymous sign-in → new map →
  `waitForURL('**/mindmaps/**')` → canvas shows root bubble + unclaimed-
  account banner.
- Signed-in home state: revisit `/` in the same context → CTA becomes
  "Browse Your Mindmaps".
- Dark mode: new context with `colorScheme: 'dark'` → body background
  should be `rgb(18, 18, 18)`.
- Mobile: 375px viewport; assert
  `document.documentElement.scrollWidth <= clientWidth`.
- Capture `pageerror` + console errors; home page should produce zero.

Screenshots to the session scratchpad, full-page for marketing routes.
