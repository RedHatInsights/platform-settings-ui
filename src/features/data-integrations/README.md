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
"Add data integration" dropdown. RHCLOUD-49536 added the data layer beneath it. Both tab
bodies and the creation wizard are still placeholders — **nothing renders this data yet.**

| Piece | State | Owner |
| --- | --- | --- |
| Page shell, routing, header, dropdown | Done | RHCLOUD-49532 |
| Data layer (`data/api`, `data/queries`, `data/mocks`) | Done | RHCLOUD-49536 |
| "My data integrations" table | Placeholder | RHCLOUD-50925 |
| About tab content | Done — hero CTA copy still placeholder | RHCLOUD-49534, copy in RHCLOUD-51526 |
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
├── constants/
│   ├── docs.ts                        # guide URL + per-provider anchors
│   └── sourceTypeIcons.ts             # frontend-assets logo paths
├── data/                              # see "Data layer" below
├── features/
│   └── about/                         # About tab (RHCLOUD-49534)
│       ├── AboutTab.tsx
│       ├── AboutTab.stories.tsx
│       ├── messages.ts
│       └── components/UseCaseCard.tsx
└── components/
    ├── AddDataIntegrationDropdown.tsx
    ├── AddDataIntegrationDropdown.stories.tsx
    ├── AddIntegrationWizard.tsx       # PLACEHOLDER
    └── MyDataIntegrationsTab.tsx      # PLACEHOLDER
```

The tree above lists only what the About tab touches; `features/sources-list` and
`features/source-detail` are documented in their own sections below.

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

## Data layer (RHCLOUD-49536)

The same three-tier shape Alert Manager uses, on the repo's TanStack Query convention:

```text
data-integrations/
└── data/
    ├── api/sources.ts             # APIFactory over sources-client: GraphQL list, REST detail
    ├── queries/useSources.ts      # useSources(), useSource(), sourcesKeys factory
    ├── queries/useSourceTypes.ts  # useSourceTypes(), sourceTypesKeys factory
    ├── mocks/seed.ts              # seedSources, seedSourceTypes
    ├── mocks/sources.ts           # createSourcesHandlers(), sourcesDb
    └── types/sources.types.ts
```

Rules it follows, and that anything added here has to keep to:

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

### The list goes over GraphQL; everything else is REST

`getSources()` posts to `/api/sources/v3.1/graphql`. `getSource()` and `getSourceTypes()`
use the typed REST endpoints. That is the same split `sources-ui` landed on, and it is not a
style preference — it is what the two transports can express.

`GET /sources` returns the Source columns and nothing else. Two consequences, both of which
hit the table directly:

1. **Associations can't come back inline.** The "Connected applications" column would need a
   second call. That part is survivable — `GET /applications?filter[source_id][]=…` batches
   the whole page into one request, since `source_id` is in the backend's filter whitelist.
2. **Associations can't be sorted or filtered on at all.** This is the decisive one.
   `parseSorting` in `middleware/filtering.go` never sets a subresource, and `applySortBy`
   validates the column against `^[a-zA-Z_]\w*$` — so a dotted `source_type.product_name` is
   rejected outright. There is no query-param syntax that reaches the subresource join. The
   "Type" column therefore cannot sort by provider display name over REST, only by the
   meaningless `source_type_id` foreign key. Filtering by attached application is out for the
   same reason.

The GraphQL argument parser handles both explicitly — `parseFilters` and `parseSortBy` in
`graph/arguments.go` strip a `source_type.` or `applications.` prefix and set the subresource.
So `SourcesParams.sortBy` accepts `source_type.product_name`, and `applicationTypeIds`
filters on the join.

Three things to know about the GraphQL path:

- **Arguments go as variables, never interpolated.** `sources-ui` builds its query by hand —
  `value: "${filterValue.name}"` at `entities.js:124` — which breaks the moment a search term
  or a source name contains a quote. `SOURCES_QUERY` is a constant and everything else rides
  in `variables`.
- **A failed query is HTTP 200 with an `errors` array.** `unwrap()` turns that into a throw,
  otherwise TanStack Query would treat it as a successful empty result and `isError` would
  never fire. The `Error` story covers exactly this.
- **The schema is narrower than the REST entity.** No `availability_status_error`, `uid`, or
  `version` on Source — error text lives on the individual applications. Those fields are
  marked detail-reads-only in `sources.types.ts`.

The server batches the association lookups itself (`queryResolver.Sources` stashes the page's
source IDs on the request context), so the inline `applications` do not cost an N+1 on the
backend either.

### Verified against the backend, not inferred

All of the above is checked against `RedHatInsights/sources-api-go` — `graph/schema.graphqls`,
`graph/arguments.go`, `graph/schema.resolvers.go`, `dao/filtering.go`, `middleware/filtering.go`,
`util/filtering.go`, and `public/openapi-3-v3.1.json`.

Worth recording, because it is easy to reach for the wrong reference:

- `sources-ui`'s bracketed `filter[...]` strings (`restFilterGenerator`, `entities.js:209`)
  are **never sent to the API**. They build the browser URL for deep-linking
  (`updateQuery` in `src/utilities/urlQuery.js:13`, read back by `parseQuery`). Copying them
  as proof of REST filter syntax is a mistake — one of them,
  `filter[applications][application_type_id][eq][]`, would actually be rejected.
- Filter operations the backend supports: `""`/`eq`, `not_eq`, `gt`, `gte`, `lt`, `lte`,
  `nil`, `not_nil`, `contains`, `starts_with`, `ends_with`, and the case-insensitive `eq_i`,
  `not_eq_i`, `contains_i`, `starts_with_i`, `ends_with_i`. An empty or `eq` operation with
  more than one value becomes a SQL `IN`.
- Filterable and sortable columns are whitelisted per table in `allowedFilterColumns`
  (`dao/filtering.go:11`). For `sources` that is `id`, `created_at`, `updated_at`, `paused_at`,
  `name`, `uid`, `version`, `imported`, `source_ref`, `app_creation_workflow`,
  `source_type_id`, `availability_status`, `last_checked_at`, `last_available_at`.
- Pagination defaults to `limit=100` (max 1000) and `offset=0`; sorting defaults to `id ASC`.
  `data/mocks/sources.ts` uses the same defaults so an unparameterised query behaves
  identically there.
- `availability_status` is exactly the four values in `SourceAvailabilityStatus`.

One caveat on the client, which still carries `showSource` and `listSourceTypes`: it is
generated from `RedHatInsights/sources-api`'s `openapi-3-v1.0.json`
(`javascript-clients/packages/sources/project.json:16`) — the retired Ruby API's spec — while
the live backend is `sources-api-go`. The paths line up, but the generated *types* are all
optional and are not the current service's, which is why `data/types/sources.types.ts` is
hand-written against the Go schema rather than re-exported.

### API version

The Sources API is **`/api/sources/v3.1`** — there is no v2. This is a deliberate exception
to the repo-wide "use v2" rule, which comes from notifications.
`@redhat-cloud-services/sources-client@3.0.19` exports `postGraphQL`, `listSourceTypes`, and
`showSource` — the three this island uses — plus `createSource` and `listApplicationTypes`
for the wizard and the table's applications column.

### Where the types differ from the ticket

RHCLOUD-49536's acceptance criteria name `status`, `date_added`, and `connected_applications`
on the Source entity. The v3.1 API returns none of those. The real fields are
`availability_status` and `created_at`, and applications are an association rather than a
column.

`getSources()` asks for that association inline, so `useSources` already hands
`MyDataIntegrationsTab` a `Source.applications` array for its "Connected applications"
column — no per-row call. A separate `/sources/{id}/applications` request
(`listSourceApplications`) is only needed by callers going through the REST list endpoint,
which this island does not.

What the column *will* need is `/application_types` (`listApplicationTypes`) to turn each
`application_type_id` into a display name. That is a small static catalogue, so it wants the
same long-`staleTime` treatment as `useSourceTypes`.

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
