# DDR - Console UI: Platform Settings Consolidation

## About

| Field | Value |
|---|---|
| **Summary** | Consolidate three frontend applications — `notifications-frontend`, `sources-ui`, and `user-preferences-frontend` — into a single new repository, `platform-settings-ui`, rather than refactoring them in place. The consolidated app serves Alert Manager, Data Integrations, Alert Preferences, and a Settings Overview under `/settings`. |
| **Date** | 2026-09-21 |
| **Authors** | Alexandra Ferdinand (Platform Experience Services) |
| **Jira** | [CRCPLAN-313 — User-centric Notifications UI Update](https://redhat.atlassian.net/browse/CRCPLAN-313) (feature) · [RHCLOUD-48865 — Phase 1 UI notifications redesign MVP](https://redhat.atlassian.net/browse/RHCLOUD-48865) (MVP epic) |
| **Status** | WIP — **retroactive**. Implementation began 2026-07-23; this DDR documents a decision already in flight. See status note below. |
| **Review Deadline** | _<create calendar event>_ — recommend before `platform.settings.redesign` is enabled in stage |
| **Supersedes** | n/a |
| **Folder** | Design Docs |

**Status note.** RHCLOUD-48865's checklist row "ADR Required? Long-form (approval) / Short-form (informational)" was never filled in. This DDR is written after ~2 months and 60 commits of implementation, so it is **informational/short-form** in practice: it records a decision and its rationale rather than seeking approval to proceed. Reviewers should read the Alternatives table as "was this the right call, and what do we do if not," not as an open choice. Flagged explicitly because presenting a settled decision as an open one wastes reviewer time.

---

## What

This document records the decision to build the Settings bundle overhaul as a **new, consolidated micro-frontend** (`platform-settings-ui`, route `/settings`) instead of evolving the three existing applications that own those experiences today.

It covers why a new repository was chosen over in-place refactors or federation, what has been built under that decision so far, the risks the choice creates, and the signals that would tell us it was wrong.

It does **not** cover the UX/product rationale for the Alert Manager ↔ Data Integrations split — that lives in CRCPLAN-313 and is treated here as a given input.

---

## Why

CRCPLAN-313 identifies the user-facing problem: overlapping terminology between "notifications" and "integrations" produces fragmented workflows and cognitive friction, with no clarity about which settings apply globally versus per-user.

The delivery-side problem is structural, and is what this DDR addresses:

- **Two applications claim the same route.** Both `notifications-frontend` and `sources-ui` serve `/settings/integrations`. "Integrations" means alert channels in one and cloud data sources in the other. The nomenclature split at the heart of CRCPLAN-313 cannot be expressed cleanly while that collision exists.
- **Settings is spread across three codebases with three stacks.** `user-preferences-frontend` is Redux + redux-thunk + react-fetching-library; the others differ again. The consolidated app standardizes on TanStack Query 5, PatternFly 6, and TypeScript strict mode.
- **Preferences are split from the alerting model they belong to.** Per-user alert preferences and org-level alert configuration are the two halves of the one mental model CRCPLAN-313 is trying to repair, but they are owned by different applications with different data layers.
- **The redesign is substantially a rewrite, not a reskin.** Phase 1 alone introduces a new Settings Overview landing page, a re-architected Alert Manager event list, a new Alert Preferences model, and a cleaned-up Data Integrations view. The proportion of retained UI code is low.
- **Parallel modernization pressure.** RHCLOUD-49314 ("Make HCC UI repos AI agent ready and restructuring") targets consistent structure, governance, and agent-legibility across HCC frontends. The legacy repos predate PF6, TanStack Query, and the `experience-ui-governance` standards.

The consolidation is gated behind the FEO feature flag `platform.settings.redesign`, so the new app can ship to production dark and be enabled per-environment.

---

## Solution

A single Module Federation micro-frontend, `platform-settings-ui`, owned by Platform Experience Services, serving `/settings`.

**Repository:** [RedHatInsights/platform-settings-ui](https://github.com/RedHatInsights/platform-settings-ui) — initialized 2026-07-23 from the `frontend-starter-app` blueprint.

### Architecture

Root chain: `AppEntry.tsx` → `App.tsx` (NotificationsProvider → ServiceProvider → QueryClientSetup → ErrorBoundary → Routing).

- **Feature islands** (`src/features/`). Each feature is self-contained — components, hooks, queries, mocks, stories, docs co-located. Cross-feature imports are blocked by ESLint (`experience-ui/no-boundary-violations`), so islands stay separable if a feature later moves or changes owners.
- **ServiceContext DI** (`src/shared/ServiceContext.tsx`). Features depend on an injected service layer rather than Chrome/browser APIs directly; Storybook and CLI swap in mocks. This is what makes the islands testable without a Chrome shell.
- **TanStack Query 5** for all server state; three-tier `data/api` → `data/queries` → `data/mocks` pattern per feature.
- **Kessel v2** access checks (not legacy RBAC).

### Current state (2026-09-21)

| Feature island | Route | Legacy source | Status |
|---|---|---|---|
| `alert-manager` | `/settings/alertmanager`, `/settings/eventlog` | `notifications-frontend` | Event types table, event log |
| `data-integrations` | `/settings/data-integrations` | `sources-ui` | Data layer, list table, source detail (PR #12 open) |
| `alert-preferences` | `/settings/alert-preferences` | `user-preferences-frontend` | **Not started** — RHCLOUD-49530 |
| `settings-overview` | `/settings/overview` | _(new)_ | About page |

FEO config (`deploy/frontend.yaml`) defines nav, service tiles, and search entries.

### Governance and quality baseline

Adopted from `experience-ui-governance` as canonical: ESLint plugin (`experience-ui/*`), reusable CI workflows, CodeRabbit config. Testing is three-layer — Jest units, **Storybook play functions** for component/integration (no Cypress), Playwright E2E. PF6 dynamic sub-path imports are lint-enforced; `react-intl` is mandatory for user-facing strings.

---

## Technical Details / Risks / Concerns

### Dual maintenance is already happening, not a future risk

All three legacy repos are active and unarchived, with 46 open issues between them and human commits within the last five weeks:

| Repo | Open issues | Recent work |
|---|---|---|
| `user-preferences-frontend` | 26 | RHCLOUD-50187 Kessel v1/v2 adoption (2026-08-20); PF 6.5.1 upgrade (2026-08-19) |
| `sources-ui` | 12 | RHCLOUD-51443 / 51016 docs link fixes (through 2026-09-17) |
| `notifications-frontend` | 8 | RHCLOUD-51010 live notifications fix (2026-09-09); docs links (2026-09-15) |

The clearest illustration of the cost: **Kessel adoption was implemented three times** — RHCLOUD-50187 in `user-preferences-frontend`, RHCLOUD-50185 in `sources-ui`, and again natively in `platform-settings-ui`. Every month the window stays open, cross-cutting platform work is paid for once per repo. This is the largest ongoing cost of the decision and it scales with window length.

### Feature parity is unbounded in principle

The legacy apps have years of accumulated behavior — edge cases, error states, tenant-specific handling — that is not written down. Parity gaps will be found by users rather than by us unless a parity audit is done deliberately.

### State-management conversion carries behavioral risk

RHCLOUD-49530 converts Redux + redux-thunk + react-fetching-library to TanStack Query 5 while also requiring "maintain existing preference API contract during migration." Autosave-toggle semantics are exactly where a caching/optimistic-update model swap produces subtle divergence — a toggle that appears to save but doesn't is high-impact and easy to miss in review. The MVP is deliberately narrowed to email-only, with scrollspy, per-channel toggles, and reset-to-baseline deferred.

### Route consolidation (minor)

All three legacy apps already serve under `/settings`, so this is consolidation within one bundle rather than a cross-bundle move. Two details stay in scope:

- `user-preferences-frontend` is dual-mounted — its FEO config registers `/settings/notifications/user-preferences` **and** `/user-preferences`, `/user-preferences/email`. Both entry points need redirects to `/settings/alert-preferences`.
- Its nav item ("Email preferences") lives in a separate `user-preferences` bundle segment and moves into the Settings nav.

RHCLOUD-48865 requires old links keep working across left-nav, Services menu, All Services cards, search index, Settings cog, and IAM deep links — several of which are Framework-team-owned.

### Wizard rebuild — decided

The add-integration wizard is **rebuilt in `platform-settings-ui`** (RHCLOUD-51313 + 3 follow-ups), using data-driven-forms to mirror `sources-ui`'s existing schema-driven implementation. `sources-ui` is retired rather than federated from, so there is nothing to retain in place.

**Action:** CRCPLAN-313's _Exclusions_ still read "the step-by-step modal wizard … will be substantially retained as-is, with changes limited to the removal of communication types." That text is superseded by this decision and should be amended, or a reader of the feature will hit a contradiction.

### QE coverage of alert channels

Carried forward from RHCLOUD-48865: putting email/Slack delivery into a test harness is hard. Consolidation doesn't cause this, but the new repo inherits it and the Storybook-first strategy has not yet been proven against it.

### Cross-team impact

Framework team (nav, search index, Services menu), Docs, UX, and eventually RBAC for the deferred "Alert Overrider" role. FEO changes land through `deploy/frontend.yaml`.

### Impact of missing the review deadline

Low. Implementation continues under the feature flag regardless, and the one previously-open question (wizard scope) is now decided. The residual item is documentation alignment on CRCPLAN-313.

---

## Alternatives Considered

**Option 1 — New consolidated repository** _(chosen)_: build `platform-settings-ui` fresh from the starter blueprint; retire the legacy apps behind a feature flag.

**Option 2 — Refactor `notifications-frontend` in place**: absorb sources and user-preferences into the existing notifications app incrementally.

**Option 3 — Navigation-only unification**: leave all three apps as-is; do the rename, nav grouping, and search re-indexing in Chrome only.

**Option 4 — Module Federation composition**: keep the existing repos as remotes, compose them into a thin `/settings` shell.

| Option | Summary | Contingency (reversible?) | Pros | Cons | Warning Signs | Success Signs |
|---|---|---|---|---|---|---|
| **1. New repo** _(chosen)_ | Greenfield consolidated MFE at `/settings`; legacy apps retired behind `platform.settings.redesign`. | **Reversible during the flag window** — turning the flag off restores legacy apps, which stay deployed. Expensive to reverse only after legacy retirement. | Clean route ownership resolves the `/settings/integrations` collision and unifies preferences with the alerting model; one modern baseline (PF6, TS strict, TanStack Query); governance + agent-readiness from day one; feature islands keep future ownership splits cheap. | Highest upfront cost; dual-maintenance window across three repos; parity risk against undocumented legacy behavior; no reuse of legacy test suites. | Dual-maintenance burden persists past MVP; cross-cutting work keeps getting done 3×; parity bugs found by users; flag rollout slips repeatedly. | MVP ships behind the flag on schedule; all three legacy repos archived shortly after; new features land faster here than they did in the legacy repos. |
| **2. In-place refactor** | Grow `notifications-frontend` to absorb the other two. | Reversible per-change, but the app is live throughout — every step ships to users. | No dual maintenance; retains existing tests and tribal knowledge; incremental and continuously shippable. | Route collision must still be resolved inside a live app; PF/framework migration interleaved with feature work; legacy conventions likely persist. Also assumes one app can absorb the others — but `user-preferences-frontend` is a different stack, so "refactor in place" still means a full state-management conversion, eroding the option's main advantage. | Migration and feature work block each other; PF6 migration stalls half-done; regressions in the live app. | Steady incremental delivery with no user-visible regressions and no parity gap. |
| **3. Nav-only unification** | Rename and regroup in Chrome; no code consolidation. | Trivially reversible. | Very low cost; fast; zero migration risk; delivers the nomenclature half of CRCPLAN-313 immediately. | Does not deliver the redesign — no Settings Overview, no re-architected Alert Manager, no Alert Preferences model; fragmentation and route collision remain; likely re-litigated within a year. | Stakeholders read the rename as "done" while structural problems persist; the same problem statement returns next planning cycle. | Would only be "right" if the org decided the redesign itself wasn't worth funding. |
| **4. Module Federation composition** | Thin `/settings` shell composing existing apps as remotes. | Reversible — the shell can collapse into a consolidated app or back to separate apps. | Unified navigation and URL space without a rewrite; teams keep independent deploys; incremental migration path. | Runtime composition complexity (version skew, shared-dependency conflicts across three PF/React baselines); cross-remote state and auth are awkward; inconsistent UX persists because the underlying apps are unchanged; high debugging cost. | Shared-dependency conflicts between remotes; inconsistent look-and-feel across tabs; incidents hard to attribute to a specific remote. | Unified UX achieved with materially less effort than a rewrite and no runtime instability. |

---

## Open items for reviewers

1. **Amend CRCPLAN-313's wizard exclusion** to match the decision recorded above.
2. **`alert-preferences` deserves the sharpest scrutiny** — it is the only island not yet started, and it carries both the API-contract and state-conversion risks.
3. **Template fields left open:** review deadline / calendar event; whether to add co-authors (Andrew Pinkert has commits in the widget work); long-form vs. short-form checkbox on RHCLOUD-48865.
