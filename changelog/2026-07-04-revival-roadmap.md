# Bubblemap Revival Roadmap

**Finalized 2026-07-04** after a full audit of the code, git history, CI,
Firebase config, and dependencies. Last real activity on `main` was June 2023
(repo created March 2022). This is a prioritized plan to get the project
secure, deployable, and back on a maintainable footing.

## STATUS as of 2026-07-06 — read this first

Sections 0, 1, 2, 3 (mostly), 6, and 7.1 below are **done** on the
`revival` branch — **draft PR #199**, deliberately ONE big PR for the whole
revival; keep it draft until the waves land. This file moved from the repo
root to `changelog/` per review feedback on the PR. Completed so far:

- `release-0.2.0` (Vite migration) merged; CRA fully gone.
- **Node 24 everywhere**: functions `engines`, all CI workflows, `.nvmrc`,
  CONTRIBUTING.md. 24 is Cloud Functions' max GA runtime — do not bump to
  a non-LTS Current release (26) for the functions runtime.
- CI/CD on `actions/*@v4`; archived `upload-release-asset` and unpinned
  `w9jds/firebase-action@master` replaced (release assets via
  `softprops/action-gh-release@v2`, deploys via `firebase-tools` directly).
- Deps: firebase-functions 7 (v1 subpath imports) + firebase-admin 13,
  TS 5.9, vite 8 / vitest 4 / plugin-react 6 / PWA plugin 1.x,
  react-router-dom 7, MUI 5.18, react 18.3, testing-library 16,
  react-zoom-pan-pinch migrated from the dead `@kokarn` fork to upstream v4
  (v4 exposes `context.state`, like the fork). Removed: `ai.ts`,
  `gpt3_parent.ts`, `cowsay`, `dotenv`, both peer-override blocks.
- Audit: root 113 → 18 findings, functions 36 → 15; the rest trace to the
  deliberate holds below.
- 24 stale `snyk-*` remote branches deleted.
- Backlog triage done: issues **#188–#198** filed (one per work item below),
  #133/#135 closed as obsolete, #160 superseded-comment posted.

**Wave 1 — done 2026-07-06 (all CI green):**

- **#188 Firestore rules rewritten** (§1a fix): public-edit eligibility read
  from `resource.data`, auth required on every read/write, non-owners can't
  touch `permissions`, create must set owner/createdBy/everUpdatedBy to the
  caller's uid, full schema validation, owners can't transfer ownership.
  22 rules unit tests in `src/firestore.rules.test.ts` run in CI via the
  emulator (`@firebase/rules-unit-testing` pinned `^2` for the firebase 9
  hold — bump to v5 with #191). **Rules not yet deployed to prod** — deploy
  `firebase deploy --only firestore:rules` early if the PR sits for long.
- **#189 `.env` hygiene**: `.env` untracked/gitignored; the (public,
  client-visible) values live in `.env.example`; `cd.yml`/`preview.yml` do
  `cp .env.example .env` before building (Vite reads `.env` at build time).
- **#192 react-hotkeys → react-hotkeys-hook 5**; bindings centralized in
  `src/pages/MindMap/keybindings.ts`. v5 matches on `KeyboardEvent.code`
  ('backquote', not '`'). Should close #147 — verify in the manual
  click-through.
- **#194 service worker — decision: keep PWA.** `vite-plugin-pwa` configured
  (registerType `autoUpdate`, manifest moved from `public/manifest.json`
  into `vite.config.js`). Deleted `public/service-worker.js`,
  `src/serviceWorker.js`, `public/offline.html`. The old prod worker was
  network-first for navigations, so the new `/sw.js` registration replaces
  it at the same scope; `index.tsx` deletes the orphaned `offline` cache.
- **Cherry-picks: nothing to pick.** `145-fix-delete-mindmap-confirmation`'s
  fix already landed on `main` via #146 (delete dialog is ID-scoped), and
  `no-logout-if-no-account` was superseded by #152's anonymous-user
  handling; the `145` branch tip (`334a91b`) would actually regress the
  permissions schema to the old read/write/delete arrays. Both remote
  branches are safe to delete.
- Bonus: fixed the Home page logo (last `process.env.PUBLIC_URL`, undefined
  under Vite).

**Deliberate dependency holds — do not "fix" blindly:** eslint 8 +
@typescript-eslint 6 + airbnb (no flat-config support, §5), TS 5.9 not 6.0
(parser support), firebase-admin 13 (firebase-functions 7 peer cap),
@types/node 24 (matches runtime). Resolved by later waves: firebase 9 →
12 and react 18 → 19 (Wave 3), openai 3 deleted (#190).

**Wave 2, part 1 — #195 write model, done 2026-07-06** (commit `620f362`):
`crypto.randomUUID()` string node IDs + all node ops through a single
`runTransaction` wrapper (read fresh doc → pure transform → write back).
Pure helpers + `ROOT_NODE_ID = '0'` live in `src/nodeOps.ts`;
`normalizeNodes()` coerces legacy numeric IDs to strings on read, so old
maps keep working and get persisted as strings on first edit. Concurrent
semantics: update-of-deleted no-ops (no resurrection), add-under-deleted
reattaches to root, delete reparents direct children one level up.
16 unit tests (`src/nodeOps.test.ts`) + 3 rules tests locking in the
transaction write shape. No rules change needed. **#198 undo is now
unblocked**; its natural unit is "one committed transaction".

**Wave 2, part 2 — #190 Groq swap, done 2026-07-06** (commit `36d439d`):
`gpt3.ts` now calls Groq's OpenAI-compatible chat endpoint via plain
`fetch` (model `llama-3.1-8b-instant`); `openai@3` deleted, no SDK. Key
is the `GROQ_API_KEY` Functions secret (same pattern as the old
`OPENAI_SECRET`); on any failure — missing key, bad input, quota, API
error — the function logs and returns `[]` and the panel falls back to
Datamuse (emulator-verified, incl. a real Groq 401 with a fake key).
The callable keeps its deployed name `gpt3` (a rename needs a client
change + an interactive function-delete on deploy); UI header renamed
to "AI Ideas". `datamuse` no longer declares the OpenAI secret.
**Not live until a human sets the secret** (checklist below); after the
first deploy, `OPENAI_SECRET` can be destroyed.

### Next steps, in order (each maps to a GitHub issue)

1. ~~**Wave 1**~~ — done, see STATUS above.
2. ~~**Wave 2** — #195 write model, #190 Groq swap~~ — done, see above.
3. ~~**Wave 3** — #191 reactfire removal + firebase 12, #193 MUI 9 +
   React 19~~ — done, see below.
4. **Wave 4 — product**: #197 export, #198 undo (unblocked by #195),
   #196 privacy policy + footer (draft; human review required, COPPA).

**Wave 3, part 1 — #191 reactfire removal + firebase 12, done 2026-07-06**
(commit `d0597dd`): reactfire (dead since Aug 2023, pinned firebase `^9`)
replaced by `src/firebase/index.tsx` — module-level singleton SDK init
(app → App Check → auth/firestore/functions, emulator wiring, analytics/
perf in prod) plus the hooks the app actually uses: `useAuth`/
`useFirestore`/`useFunctions` (instance getters), `useUser`/
`useSigninCheck` (single app-wide `onIdTokenChanged` subscription behind
`FirebaseUserProvider`, which blocks render until initial auth state is
known — `onIdTokenChanged` rather than `onAuthStateChanged` so
provider-link/profile changes re-render, which the Account page needs),
and `useFirestoreDocData`/`useFirestoreCollection`/
`useFirestoreCollectionData` (`onSnapshot` with a `{ status, data }`
shape and `queryEqual`-stable resubscription so callers can build
queries inline). Also done in the same pass, per §3/§8: unused Storage +
Remote Config inits deleted (with `remoteconfig.template.json` and its
`firebase.json` block); the MindMap rules-of-hooks bug fixed by
splitting loader/`LoadedMindMap` — a missing or permission-denied doc
now shows the intended friendly message instead of a raw TypeError;
Navigation/ManageMindMaps handle the now-explicit collection loading
state (reactfire's suspense previously hid it). firebase 9 → 12,
`@firebase/rules-unit-testing` 2 → 5, lockfile regenerated (the old lock
still carried reactfire's `^9` pin).

**Wave 3, part 2 — #193 MUI 9 + React 19, done 2026-07-06** (commit
`1630982`): **go decision** — MUI skipped v8 entirely; v9 (9.2) still
defaults to emotion (pigment-css is an optional peer) and supports
React 19, so we took the latest major directly instead of parking on
6/7. Churn was small: `@mui/codemod deprecations/all` handled the
slotProps consolidation (TextField `inputProps`/`InputProps`, Snackbar
`TransitionProps`, ListItemText `primaryTypographyProps`, Drawer
`PaperProps`); manual fixes for Menu `PaperProps`, InputBase
`inputProps`, and the nine legacy `Grid item xs/sm` usages → v9 `size`
prop (GridLegacy is removed). React 19 needed exactly one code change
(`useRef` initial value in MindMapSimulation). All peers (router 7,
zoom-pan-pinch 4, hotkeys-hook 5, testing-library 16) declare React 19
support. Audit baseline after both parts: root 11 findings (5 moderate,
6 high), all transitive through dev-only `firebase-tools`; functions
unchanged. **Visual smoke check of all routes is folded into the
existing manual click-through item below** — the theme toggle and
MindMap chrome especially.

**Human-only checklist (blockers for the waves above):**

- [ ] Manual click-through of the canvas (pan/zoom/drag/hotkeys) after the
      zoom-fork migration and the hotkeys swap — nothing has physically
      dragged a bubble yet; also confirms #147 so #192 can close it.
      **Now also covers Wave 3**: all routes on MUI 9 + React 19 (theme
      toggle, dialogs/menus, Account grids) and the reactfire-removal
      auth/data flows (anonymous sign-in, claim-account snackbar,
      mindmap list loading states).
- [ ] Create a Groq API key; `npx firebase-tools functions:secrets:set GROQ_API_KEY`.
- [ ] Firebase console: verify App Check enforcement is ON for Firestore,
      and API-key HTTP-referrer restrictions on both projects.
- [ ] Read the privacy policy draft before it ships.
- [ ] Optional: deploy the fixed Firestore rules ahead of the PR merge
      (`firebase deploy --only firestore:rules`) — the prod hole is live
      until then.
- [ ] Optional: delete the superseded `145-fix-delete-mindmap-confirmation`
      and `no-logout-if-no-account` remote branches.

**Dev-environment notes (local machine):** the Firebase emulators need a
JDK 21+ (installed via `brew install openjdk@21`, keg-only at
`/opt/homebrew/opt/openjdk@21` — set `JAVA_HOME`); use `nvm use` (Node 24)
before npm/firebase commands — the login shell may default to Node 16.

Parallelism note: #196 and #197 touch mostly new files and can run in
isolated worktrees alongside spine work; everything else collides in
`src/pages/MindMap/` and should stay sequential.

## Where the project actually stands today

Verified, not guessed:

- **Deploys are blocked.** Cloud Functions pins Node 16
  (`functions/package.json` `engines`), a decommissioned runtime GCF no
  longer accepts. `cd.yml` runs a full `firebase deploy` (hosting + rules +
  functions), so the functions step fails the whole release pipeline.
- **Every OpenAI-backed function is broken in production.**
  - `gpt3.ts` calls `createCompletion` with `gpt-3.5-turbo` — a chat model
    on the legacy completions endpoint; invalid request.
  - `ai.ts` and `gpt3_parent.ts` call `text-davinci-002`, which OpenAI shut
    down in January 2024.
  - Mitigating detail: the client (`GenIdeaPanel`) only ever calls `gpt3`
    and `datamuse`. `ai` and `gpt3_parent` are deployed dead code.
  - The **Datamuse fallback still works** — idea generation is degraded,
    not dead.
- **The Firestore rules have a real privilege-escalation hole** (see #1).
- **Vulnerability counts:** root `npm audit` = 113 (8 critical, 58 high,
  26 moderate, 21 low), almost all transitive through `react-scripts`;
  `functions` = 36 (2 critical, 21 high, 9 moderate, 4 low).
- **What still works:** hosting, auth (Google/password/anonymous),
  Firestore sync, the mind-map editor itself, Datamuse suggestions.

## 0. Don't start from scratch — the modernization branch is a fast-forward

`origin/release-0.2.0` branches from `940c7da` — **the current tip of
`main`**. It is not stale and needs no rebase; it's a clean fast-forward
containing:

- **CRA → Vite migration** (`70dbdf3`) — removes `react-scripts` entirely
  (`vite.config.js`, `tsconfig.node.json`, `src/env.d.ts`, env-var rename to
  `import.meta.env`).
- **Node 16 → 18** for Cloud Functions (`9e5e8d6`) — directionally right,
  needs pushing to 20/22 (#2).
- Removal of dead `functions/src/ai/ai.ts` and hardening of `gpt3.ts`
  against a missing `OPENAI_SECRET` (`8e96f4e`).

**First step: check out `release-0.2.0`, `npm ci`, build, click through the
app against emulators, then merge.** The only work is verification, not
migration.

Other unmerged branches, checked individually:

- `160-update-openai-version` — deletes **both** `ai.ts` and
  `gpt3_parent.ts` and rewrites `gpt3.ts` for the modern OpenAI v4 API.
  Superseded by the Groq decision (#4) but useful as a reference for the
  callable-function shape; its dead-code removal is worth taking either way.
- `145-fix-delete-mindmap-confirmation` (2 commits) — delete-confirmation
  state-scoping fix; likely still applies, cherry-pick and test.
- `no-logout-if-no-account` (1 commit) — small auth UX fix; same treatment.

**Repo hygiene:** ~24 stale `snyk-fix-*` / `snyk-upgrade-*` bot branches sit
on the remote from a dead Snyk integration. Delete them so `git branch -a`
is readable again.

## 1. Security — one confirmed vulnerability, one hygiene fix

### 1a. Firestore rules: public maps can be hijacked (fix and deploy now)

The `update` rule in `firestore.rules` reads the public-edit flag from the
**incoming write** instead of the existing document:

```
allow update: if request.auth.uid != null && request.auth.uid == resource.data.permissions.owner
  || (resource.data.permissions.isPublic && request.resource.data.permissions.canPublicEdit);
```

`request.resource.data` is the attacker-controlled payload. Consequences,
in decreasing severity:

1. **Any public map — including view-only ones — can be modified by anyone**
   simply by including `permissions.canPublicEdit: true` in the write. The
   `canPublicEdit: false` setting the owner chose in ShareDialog is not
   actually enforced.
2. **Nothing restricts which fields an update may change**, so that same
   write can set `permissions.owner` to the attacker's UID and
   `isPublic: false` — a full ownership takeover that locks the real owner
   out.
3. The public-edit clause **never checks `request.auth`**, so even
   unauthenticated requests pass rules on public docs (App Check helps only
   if Firestore enforcement is actually turned on in the console — verify).
4. `allow create: if request.auth.uid != null;` doesn't require
   `request.resource.data.permissions.owner == request.auth.uid`, so anyone
   can create maps "owned" by an arbitrary UID, planting docs in a victim's
   map list.

The corrected rules must: read `canPublicEdit` from `resource.data`; require
`request.auth != null` on every write path; forbid non-owners from touching
`permissions` (e.g. `request.resource.data.permissions ==
resource.data.permissions`); and enforce `owner == request.auth.uid` on
create. Add schema/size validation while in there.

**This deploys independently of everything else** — `firebase deploy --only
firestore:rules` doesn't touch the dead Node 16 runtime. It's the single
highest-value hour in this document; do it before any refactoring. Pair it
with rules unit tests (#7) so it can't regress silently.

### 1b. Stop committing `.env`

`.env` is tracked in git and absent from `.gitignore`. It holds only
Firebase Web SDK config for both projects (`bubblemap-app`,
`mind-map-testing`) — client-visible identifiers, not true secrets — but:

- Add `.env` to `.gitignore`, commit `.env.example` instead.
- Verify in the Google Cloud console that API-key restrictions (HTTP
  referrers) are configured for both projects — that plus the rules above
  is the real security boundary. Rotate keys if you want to be thorough;
  they've been public for years.
- `OPENAI_SECRET` is correctly handled via Functions secrets
  (`runWith({ secrets: [...] })`) — keep that pattern for the Groq key.

## 2. Toolchain: CRA is dead, Node 16 is dead

Two forcing functions, not optional cleanup:

- **`react-scripts` is deprecated/unmaintained** and the source of nearly
  all 113 root audit findings (transitive `webpack-dev-server`/`ws`/etc.).
  The `release-0.2.0` merge (#0) removes it.
- **GCF Node 16 is decommissioned** — deploys fail today. `release-0.2.0`
  moves to 18, which is also past end-of-support; go straight to **20 or
  22**. This blocks the CD pipeline and any functions change including the
  Groq swap.

Order: merge the Vite branch → bump `functions/package.json` engines +
`firebase-functions`/`firebase-admin` as needed for the runtime → re-run
`npm audit` on `/` and `/functions` to confirm the new baseline.

Also swept up by the Vite migration: the hand-rolled service worker
(`public/service-worker.js`, `src/serviceWorker.js`) — CRA-era PWA plumbing.
Decide to port it (`vite-plugin-pwa`) or drop PWA support for now; don't
leave a stale service worker caching old bundles for returning users.

## 3. Dependency cleanup and upgrades

After #2, in small batches with emulators running (`npm start`), committing
between batches so breaks bisect easily:

| Package                                 | Current    | Action                                                                                                                                                                               |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `openai` (functions)                    | 3.1.0      | **Remove** — replaced by Groq (#4)                                                                                                                                                   |
| `cowsay` (functions)                    | 1.5.0      | **Remove** — only referenced in commented-out debug lines                                                                                                                            |
| `dotenv` (root)                         | 16.x       | **Remove** — never imported; CRA/Vite load `.env` themselves                                                                                                                         |
| `react-zoom-pan-pinch` (root)           | 2.6.0      | **Remove** — unused; only the `@kokarn` fork is imported                                                                                                                             |
| `@kokarn/react-zoom-pan-pinch`          | 2.1.5      | Migrate back to upstream `react-zoom-pan-pinch` (actively maintained; the fork is dead) — then delete both `overrides` blocks in package.json                                        |
| `react-hotkeys`                         | 2.0.0      | Dead since ~2020. Replace with `react-hotkeys-hook` or plain `keydown` handlers — it's one `keyMap` + `GlobalHotKeys` in three files                                                 |
| `reactfire`                             | 4.2.2      | Dead (last publish Aug 2023). Replace with 3–4 small custom hooks over the modular SDK (`onSnapshot`, `onAuthStateChanged`) — don't swap for `react-firebase-hooks`, which is deader |
| `firebase` (client)                     | 9.17.1     | → 12.x, spans several majors; do alongside the reactfire removal since both touch every data callsite                                                                                |
| `firebase-admin` / `firebase-functions` | 11.5 / 4.2 | → current, together with the Node bump (#2)                                                                                                                                          |
| `firebase-tools` (dev)                  | 11.22      | → current; low risk                                                                                                                                                                  |
| `react-router-dom`                      | 6.8.1      | → 7.x; check the data-router migration notes                                                                                                                                         |
| `@mui/*`                                | 5.11.x     | → at least latest 5.x; decide separately whether to take 6/7                                                                                                                         |
| `typescript`                            | 4.9.5      | → 5.x; prerequisite for current `@types/*` and lint tooling                                                                                                                          |
| `prettier`                              | 2.8.4      | → 3.x, alongside #5                                                                                                                                                                  |

Unused-SDK dead weight found in `App.tsx`, cheap to delete during the
firebase bump:

- **Storage** is initialized and wired to an emulator on port 9199 — but
  `firebase.json` defines no storage emulator, there are no storage rules,
  and nothing in the app ever uses Storage. Delete the init (or configure
  it properly if uploads are on the product roadmap).
- **Remote Config** is initialized and `fetchAndActivate`d on every prod
  load, but no code ever reads a config value, and
  `remoteconfig.template.json` is an empty `{}`. Delete the init and the
  template until there's an actual flag to ship.

## 4. Replace OpenAI with a single shared Groq key — decided

Scope, updated by the code audit: the client calls only `gpt3` and
`datamuse`, so this is **one function to convert, two to delete**.

- **Delete `ai.ts` and `gpt3_parent.ts`** (already broken, never called;
  the `160` branch already did this — cherry-pick or redo, it's small).
- **Convert `gpt3.ts` to Groq's chat-completions API.** It's
  OpenAI-compatible (same request/response shape), so this is a base-URL +
  client swap plus moving to the chat message format, not a rewrite.
- **Single shared app-level key, not bring-your-own-key.** Store one Groq
  key as a Functions secret exactly like `OPENAI_SECRET` today. The feature
  keeps working for every signed-in user with zero setup. (BYOK rejected:
  key acquisition friction — phone verification, credit cards — is
  disproportionate for a casual mind-mapping user; the operator-cost
  constraint only requires the _operator's_ usage to be free.)
- **Accepted tradeoff:** one shared free-tier quota. A burst from one user
  can briefly exhaust the per-minute/per-day limits for everyone; the panel
  should degrade gracefully to Datamuse (it already renders both sources
  independently, so this mostly falls out for free — verify the error
  path). Revisit throttling or a paid tier only if it actually bites.
  Skim Groq's acceptable-use terms once before relying on this long-term.
- **No multi-provider abstraction.** One small AI feature, one provider.
- **Keep Datamuse** — it's the deliberate fallback and currently the only
  working idea source.

Blocked by the Node runtime bump (#2) for deployment, but the code change
can be written and emulator-tested anytime.

## 5. Lint/format tooling refresh

`eslint-config-airbnb` + `airbnb-typescript` lack first-class ESLint 9
flat-config support. When touching ESLint: either stay on ESLint 8 + airbnb
(lowest churn) or move to ESLint 9 flat config with `typescript-eslint`'s
recommended configs. `prettier` 2→3 alongside. Low priority; nothing else
depends on it.

## 6. CI/CD workflows are pinned to end-of-life actions

All three workflows (`ci.yml`, `cd.yml`, `preview.yml`):

- `actions/checkout@v2`, `setup-node@v2`, `cache@v2` → `@v4`.
- `node-version: '16'` in all three → match the #2 runtime choice. Also
  update `.github/CONTRIBUTING.md`, which still tells contributors to
  install Node 16.
- `cd.yml`: `actions/upload-release-asset@v1` is archived → `softprops/
action-gh-release` or `gh release upload`. `w9jds/firebase-action@master`
  is pinned to a moving target (supply-chain risk) → pin a tag/SHA or run
  `firebase-tools` directly.
- `preview.yml`: `FirebaseExtended/action-hosting-deploy@v0` still works
  but check for a current release while in there.
- CI's test job runs `react-scripts test --passWithNoTests` — i.e. green
  with zero tests. Replace alongside #7.
- Note: CI/preview/CD jobs are gated on `github.repository_owner ==
'SpiritSeal'` — if the revival happens on a fork, those guards need
  updating before any of this runs at all.

## 7. Tests: none exist

Zero `*.test.*` files under `src/` (only `setupTests.ts`), and CI passes
via `--passWithNoTests`. Post-Vite, `react-scripts test` disappears anyway
→ use **Vitest**. Priority order for what to actually write:

1. **Firestore rules tests** (`@firebase/rules-unit-testing`) covering the
   #1a exploit scenarios — hijack via `canPublicEdit` payload, permission
   mutation by non-owner, create-with-foreign-owner. These lock in the
   security fix.
2. **Node-operation logic** — add/delete/update, the reparenting behavior
   in `deleteNode`, ID assignment (see #8).
3. Smoke render of the main routes.

Ideally the rules tests land with #1a (they don't depend on the toolchain
work at all — the emulator setup already supports them).

## 8. Data-integrity debt in the editor core (read before building undo/presence)

Found while auditing `src/pages/MindMap/index.tsx`; these shape the later
product work:

- **Node IDs are minted client-side as `max(existing ids) + 1`** from the
  local snapshot. Two collaborators adding nodes concurrently can mint the
  same ID → two nodes with one identity, and tree traversal breaks.
- **Edits are `arrayRemove(oldNode) + arrayUnion(newNode)` batches.** If
  the local copy of `oldNode` is stale (someone else just edited it), the
  `arrayRemove` silently no-ops and the `arrayUnion` adds a duplicate node
  with the same `id`. Same failure class for concurrent delete+edit.
- `updateNode` refuses ID changes with only a `console.warn`; `deleteNode`
  reparents children one level up (grandchildren handling is implicit —
  verify with a test).
- **React correctness bug in the same file:** `useState(rootNode)` is
  called _after_ two conditional `throw` statements, violating the
  rules of hooks; and `mindmap.nodes` is dereferenced before the
  `if (!mindmap) throw` guard, so a missing/denied doc dies with a raw
  TypeError instead of the intended message. Small fix, do it with #3's
  reactfire-removal pass through this file.

Minimal remediation (no CRDT rewrite): random string node IDs (e.g.
`crypto.randomUUID()`), and either Firestore transactions for node ops or a
`nodes/{nodeId}` subcollection so concurrent edits touch different docs.
Decide this **before** implementing undo (#10), because undo semantics
depend on the write model.

## 9. Smaller housekeeping

- `docs/dependency-cruiser-graph-*` artifacts are stale generated output —
  regenerate via script/CI or stop committing them (keep
  `docs/_runDepcruiser.sh`).
- Root `package.json` has no `engines` field — add one when the Node
  version settles.
- `.env` has inconsistent `KEY = value` spacing — fix when doing #1b (the
  Vite migration renames everything to `VITE_*` anyway).
- `remoteconfig.template.json` — deleted along with the Remote Config init
  (#3), or kept deliberately if a use appears.
- README is four lines; refresh it once the stack stabilizes (new dev
  setup, Node version, Vite commands).
- **Add the original submission video to the Home page.** Bubble Map won
  first place in the 2022 Congressional App Challenge (AZ-06); embed the
  "Introducing Bubble Map" video (responsive `youtube-nocookie.com/embed/`
  iframe) with a mention of the award. No dependency on anything above.

## 10. Footer, privacy policy, and (maybe) ads

**Footer.** Follow the exact pattern `Navigation` uses in
`src/components/Routing/index.tsx`: present on Home, About, SignIn,
CreateAccount, Account, ManageMindMaps; deliberately **absent** on
`/mindmaps/:mindmapID`, which already omits `<Navigation />` to keep the
canvas chrome-free. Content: privacy policy link, GitHub link, optionally
the award mention.

**Privacy policy — a real compliance need**, because the app already
collects real data:

- Firebase Auth: email, display name, provider IDs — **and anonymous
  accounts are created automatically for every visitor who opens
  `/mindmaps` or a shared map** (`AnonymousAuth` wraps those routes). Users
  are in the auth system before they ever consent to anything; the policy
  must reflect that. (Operationally: consider Firebase's auto-cleanup of
  stale anonymous accounts, since they'll accumulate forever otherwise.)
- Firestore: map titles, node text, collaborator UIDs, `everUpdatedBy`
  history.
- Google Analytics + Performance Monitoring — active in `App.tsx` today.
- App Check (reCAPTCHA v3) — device/browser signal.
- If ads land: ad-tech cookies on top.

The pitch targets students, so some users are plausibly under 13 → COPPA
applies: affects sign-up flow, and if ads run, requires child-directed/
non-personalized configuration. Draft the page from the list above, but a
human (you, or counsel if being careful) reads it before it ships.

**Ads — an open decision, not a commitment:**

- Requires the live privacy policy first (AdSense won't approve without
  one), so strictly sequenced after it.
- Placement is limited: the product is a full-screen canvas; realistic ad
  surface is only the marketing shell (Home/About/ManageMindMaps), capping
  revenue.
- The likely-student audience means non-personalized ads (pay less) plus
  compliance overhead.
- The project's identity is explicitly "free, no subscription" — a
  donation/support link may fit better than an ad network.
- If proceeding anyway: AdSense is the default; EthicalAds is the
  lower-friction, non-tracking alternative suited to a student/dev
  audience, at lower revenue.

## 11. Product improvements beyond the tech refresh

Gaps in the product itself, ranked by impact vs. effort:

- **No export.** Only way to share a map is a live link. Add PNG/SVG export
  of the canvas and a Markdown outline export of the node tree. High
  impact, low effort, no sync-architecture entanglement.
- **No undo.** Worse than in a normal editor because edits are shared and
  destructive (see #8 — a collaborator's overwrite is unrecoverable).
  Scope to local/session undo first. **Depends on the #8 write-model
  decision.**
- **No node styling.** `node` is `{ parent, text, id }` — no color, icon,
  or image. Schema change plus UI in `Bubble.tsx` and the edit dialog.
- **Blank-canvas onboarding.** New users get one empty node. A few starter
  templates (brainstorm, SWOT, pro/con) are cheap and directly serve the
  "quickly get ideas out" pitch.
- **Mobile UX audit.** The interaction model is keyboard-first
  (`keyMap` in `MindMap/index.tsx`: ctrl+enter, shift+enter, arrows…) —
  several bindings have no touch equivalent at all, while the student
  audience skews mobile. Pan/zoom already works; node CRUD on touch needs
  a designed answer (long-press menu, persistent toolbar, etc.).
- **No presence.** Firestore sync makes collaboration _eventually
  consistent_, not _live-feeling_ — no cursors, no "who's here." Most
  involved item on this list; do it after #8's write model settles, since
  presence and conflict handling belong to the same architecture
  conversation.

## Suggested sequencing

1. **Firestore rules fix + rules tests** (#1a, #7.1) — confirmed
   vulnerability, deployable today, independent of everything else.
2. **`.env` hygiene** (#1b) and **branch cleanup** (#0's snyk purge) —
   cheap, same afternoon.
3. **Merge `release-0.2.0`** (#0) — fast-forward, verify against emulators;
   cherry-pick `145-…` and `no-logout-…` while at it.
4. **Node 20/22 for functions + workflow bumps** (#2, #6) — unblocks all
   deploys; the CD pipeline works again after this.
5. **Groq swap + dead function deletion** (#4) — isolated; restores the
   AI feature.
6. **Dependency batches** (#3) — firebase+reactfire first (biggest,
   riskiest), then router/MUI/TS, then the small removals; fix the #8
   hooks bug during the reactfire pass.
7. **#8 write-model decision** (random IDs, transactions or subcollection)
   — before any product feature that touches writes.
8. **Vitest + node-op tests** (#7) — as part of or right after 6/7.
9. **Lint refresh** (#5) and **housekeeping** (#9) — whenever convenient.
10. **Footer + privacy policy** (#10) — once the stack stops moving, since
    the policy must describe what's actually live.
11. **Product work** (#11): export → undo → styling/templates → mobile →
    presence. Ads decision (#10) last, only after the policy is live and
    only if it still seems worth it.
