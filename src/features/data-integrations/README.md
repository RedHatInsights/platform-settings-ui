# Data Integrations

Data source management (AWS, Azure, Google Cloud, OpenShift Container Platform) for the
platform settings area, at `/settings/data-integrations`.

This island is the destination for the `sources-ui` migration. **`sources-ui` is being
retired, not federated from** — nothing here loads remote modules from it, and everything it
does eventually lands here as ported or rebuilt code.

Note the naming split: *data* integrations are sources of data (this island), while
communication integrations — Slack, ServiceNow, webhooks, and the rest — stay with Alert
Manager. That distinction is the reason for the `data-` prefix on the route.

## Status

RHCLOUD-49532 delivered **the shell only**: routing, page header, tabs, and the
"Add data integration" dropdown. Both tab bodies and the creation wizard are placeholders.

| Piece | State | Owner |
| --- | --- | --- |
| Page shell, routing, header, dropdown | Done | RHCLOUD-49532 |
| Data layer (`data/api`, `data/queries`, `data/mocks`) | Not started | RHCLOUD-49536 |
| "My data integrations" table | Placeholder | RHCLOUD-50925 |
| About tab content | Placeholder | RHCLOUD-49534 |
| Creation wizard | Placeholder | No story yet — needs filing |
| Non-admin / permission gating | `isDisabled` prop, unwired | RHCLOUD-50927 |

## Structure

```text
data-integrations/
├── DataIntegrationsPage.tsx           # PageHeader + routed Tabs + <Outlet/>
├── DataIntegrationsPage.stories.tsx
├── index.ts                           # named re-exports
├── messages.ts                        # react-intl defineMessages, namespaced dataIntegrations.*
├── types.ts                           # SourceTypeName union
└── components/
    ├── AddDataIntegrationDropdown.tsx
    ├── AddDataIntegrationDropdown.stories.tsx
    ├── AddIntegrationWizard.tsx       # PLACEHOLDER
    ├── MyDataIntegrationsTab.tsx      # PLACEHOLDER
    └── AboutTab.tsx                   # PLACEHOLDER
```

`experience-ui/no-boundary-violations` is set to `error`, so nothing here may import from
`alert-manager` or `settings-overview`. Shared code goes through `src/shared/`,
`src/Components/`, or `src/hooks/`.

## Routed tabs

The active tab is derived from the URL rather than held in component state, so a reload or a
shared link lands on the same tab. `Routing.tsx` mounts the page with two children:

```tsx
{
  path: 'data-integrations',
  element: DataIntegrationsPage,
  childRoutes: [
    { path: '',      element: MyDataIntegrationsTab },
    { path: 'about', element: DataIntegrationsAboutTab },
  ],
}
```

Navigation goes through `useAppNavigate`, which prefixes Chrome's basename
`/${getBundle()}/${getApp()}`. Chrome derives `getApp()` from the second path segment, so on
both `/settings/data-integrations` and `/settings/data-integrations/about` the basename is
`/settings/data-integrations` and relative navigation resolves correctly. Stories reproduce
this by nesting a `StorybookMockProvider` with `app="data-integrations"`; without it the
preview-level default (`platform-settings`) would give the wrong basename.

## Data layer seam (RHCLOUD-49536)

**The shell fetches nothing today** — there are no queries, no MSW handlers, and no mock
seed. When the data layer lands it follows the repo's TanStack Query convention, the same
three-tier shape Alert Manager uses:

```text
data-integrations/
└── data/
    ├── api/sources.ts        # APIFactory wrapper over @redhat-cloud-services/sources-client
    ├── queries/sources.ts    # useSources(), useSourceTypes(), sourcesKeys factory
    ├── mocks/{seed,sources}.ts
    └── types/sources.types.ts
```

Rules that apply when filling this in:

- **All server state goes through `@tanstack/react-query`.** No `useEffect` + `useState`
  fetching, no bare axios calls in components. The `QueryClient` is provided app-wide by
  `QueryClientSetup`.
- **Get axios from `useAppServices()`**, not by importing a module-level instance — that is
  what makes stories and tests able to swap it out. `src/shared/AppServices.types.ts` exposes
  the authenticated instance.
- **Query keys live in a factory** next to the hooks (`sourcesKeys.all` / `.lists()` /
  `.list(params)`), so mutations can invalidate precisely.
- **Mocks are MSW v2 handler factories** backed by `createResettableCollection()` from
  `src/shared/mockCollections.ts`, with story assertions reading from the shared seed.

Consumers to expect: `MyDataIntegrationsTab` needs `useSources` (paginated, filterable, with
`useTableState` per `experience-ui/require-use-table-state`); the creation wizard needs
`useSourceTypes` plus a create mutation.

### API version

The Sources API is **`/api/sources/v3.1`** — there is no v2. This is a deliberate exception
to the repo-wide "use v2" rule, which comes from notifications.
`@redhat-cloud-services/sources-client` exports `ListSources`, `ListSourceTypes`,
`ShowSource`, and `CreateSource`, covering both the list and the wizard.

## Add data integration dropdown

Adapted from `sources-ui`'s `IntegrationsDropdown`, with two departures: the items are
**providers** rather than categories, and there are exactly four.

| Group | Item | `SourceTypeName` |
| --- | --- | --- |
| Red Hat integrations | OpenShift Container Platform | `openshift` |
| Other cloud providers | Amazon Web Services | `amazon` |
| Other cloud providers | Google Cloud Platform | `google` |
| Other cloud providers | Microsoft Azure | `azure` |

Those values are the Sources API's `source_type.name` strings, so a selection passes straight
to the data layer and the wizard without translation.

The dropdown takes `isDisabled` (default `false`) as the seam for permission gating. Do not
wire permissions here — RHCLOUD-50927 owns the non-admin experience and will read
`isOrgAdmin` / the Kessel access check.

## Placeholders

`AddIntegrationWizard.tsx` is a modal that names the selected provider and nothing else. The
real wizard is a rebuild of `sources-ui/src/components/addSourceWizard/` (~40 files,
data-driven-forms, per-provider schemas). **Keep the `{ isOpen, sourceType, onClose }`
contract stable** — that is the whole point of the placeholder, and it means the dropdown
needs no rework when the wizard arrives.

Detail, edit, and remove flows (`sourcesDetail`, `sourcesDetailRename`,
`sourcesDetailRemove`, `sourcesDetailAddApp`, `sourcesDetailRemoveApp`,
`sourcesDetailEditCredentials` in `sources-ui/src/routes.ts`) have no story in the epic
either. Their URL shapes are intentionally not guessed at here.

## Deployment

`deploy/frontend.yaml` already carries the `data-integrations` nav item and the
`platform-settings-integrations` search entry, both gated on the `platform.settings.redesign`
feature flag. The sidebar entry only appears with that flag on.
