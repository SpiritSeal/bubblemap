# Bubblemap Revival Roadmap

**Finalized 2026-07-04** after a full audit of the code, git history, CI,
Firebase config, and dependencies. Last real activity on `main` was June 2023
(repo created March 2022). This is a prioritized plan to get the project
secure, deployable, and back on a maintainable footing.

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
