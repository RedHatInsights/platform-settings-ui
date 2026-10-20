# Alert Manager

Manages notification event log, behavior groups, and alert configuration for the platform settings area.

## Structure

```
alert-manager/
├── AlertManagerPage.tsx
├── AlertManagerPage.stories.tsx
├── event-types/
│   ├── AlertManagerTable.tsx      # Fetches event types and notifiers
│   └── components/
│       └── NotifierBadges.tsx     # Displays notifier state from props
├── event-log/
│   ├── EventLogPage.tsx           # Route-level page and date range
│   ├── EventLogPage.stories.tsx
│   └── EventLogTable.tsx          # Fetches events and bundle facets
├── data/
│   ├── api/
│   │   └── events.ts              # APIFactory wrapper for notifications client
│   ├── queries/
│   │   └── events.ts              # useEvents() hook, query key factory
│   ├── mocks/
│   │   ├── seed.ts                # Seed data for MSW handlers and story assertions
│   │   └── events.ts              # MSW v2 handler factories
│   └── types/
│       └── events.types.ts        # Strongly-typed event log interfaces
```

### API Client

Uses `@redhat-cloud-services/notifications-client` via `APIFactory`. The authenticated axios instance is injected through `ServiceContext`.

### Query Hooks

- `useEvents(params?)` — paginated event log list with filter support and `keepPreviousData` for smooth pagination.

### Query Keys

```ts
eventsKeys.all          // ['events']
eventsKeys.lists()      // ['events', 'list']
eventsKeys.list(p)      // ['events', 'list', params]
```

### MSW Mocks

`createEventsHandlers(baseUrl?)` returns MSW v2 handlers backed by `eventsDb` (a resettable collection). Supports sorting, filtering by event name, endpoint types, action status, severity, and offset pagination. Stories reference `seedEvents` from `mocks/seed.ts` for assertions.

### Event Log Page

The Event Log page (`event-log/EventLogPage.tsx`) displays a paginated table of notification events with:

- **Admin gate** — non-admin users see a `NotAuthorized` screen (pending Kessel `EVENTS_VIEW` permission rollout)
- **Filters** — Event name (text), Service, Severity (checkboxes)
- **Date range** — Preset selector (Today, Yesterday, Last 7/14 days)
- **Severity column** — Colored labels with PatternFly severity icons
- **Notifiers column** — Grouped action badges by endpoint type
- **Row actions** — Kebab menu with "Manage my own alert preferences" and admin-only "Manage organization default settings"
