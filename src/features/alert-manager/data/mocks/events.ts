import { HttpResponse, http } from 'msw';
import { createResettableCollection } from '../../../../shared/mockCollections';
import type { EventLogEntry, PageEventLogEntry } from '../types/events.types';
import { seedBundles } from './bundles';
import { seedEvents } from './seed';

export const eventsDb = createResettableCollection(seedEvents);

function sortEvents(
  events: EventLogEntry[],
  sortBy?: string | null,
): EventLogEntry[] {
  if (!sortBy) {
    return events;
  }

  const [field, direction] = sortBy.includes(':')
    ? sortBy.split(':')
    : [sortBy, 'asc'];

  const sorted = [...events].sort((a, b) => {
    const aVal = a[field as keyof EventLogEntry] ?? '';
    const bVal = b[field as keyof EventLogEntry] ?? '';
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}

export function createEmptyEventsHandler(baseUrl = '/api/notifications/v3') {
  return http.get(`${baseUrl}/notifications/events`, () =>
    HttpResponse.json({ data: [], links: {}, meta: { count: 0 } }),
  );
}

export function createErrorEventsHandler(baseUrl = '/api/notifications/v3') {
  return http.get(`${baseUrl}/notifications/events`, () =>
    HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
  );
}

export function createEventsHandlers(baseUrl = '/api/notifications/v3') {
  return [
    http.get(`${baseUrl}/notifications/events`, ({ request }) => {
      const url = new URL(request.url);
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const bundleIds = url.searchParams.get('bundleIds');
      const appIds = url.searchParams.get('appIds');
      const severities = url.searchParams.get('severities');
      const eventTypeDisplayName = url.searchParams.get('eventTypeDisplayName');
      const endpointTypes = url.searchParams.get('endpointTypes');
      const status = url.searchParams.get('status');
      const sortBy = url.searchParams.get('sortBy');

      let filtered = eventsDb.findAll();

      if (bundleIds) {
        const ids = bundleIds.split(',');
        const bundleNames = ids
          .map((id) => seedBundles.find((b) => b.id === id)?.name)
          .filter(Boolean) as string[];
        const filterSet = new Set([...ids, ...bundleNames]);
        filtered = filtered.filter((e) => filterSet.has(e.bundle));
      }
      if (appIds) {
        const ids = appIds.split(',');
        filtered = filtered.filter((e) => ids.includes(e.application));
      }
      if (severities) {
        const sevs = severities.split(',');
        filtered = filtered.filter(
          (e) => e.severity && sevs.includes(e.severity),
        );
      }
      if (eventTypeDisplayName) {
        const search = eventTypeDisplayName.toLowerCase();
        filtered = filtered.filter((e) =>
          e.event_type.toLowerCase().includes(search),
        );
      }
      if (endpointTypes) {
        const types = endpointTypes.split(',');
        filtered = filtered.filter((e) =>
          e.actions.some((a) => types.includes(a.endpoint_type)),
        );
      }
      if (status) {
        const statuses = status.split(',');
        filtered = filtered.filter((e) =>
          e.actions.some((a) => statuses.includes(a.status)),
        );
      }

      filtered = sortEvents(filtered, sortBy);

      const page = filtered.slice(offset, offset + limit);

      const response: PageEventLogEntry = {
        data: page,
        links: {},
        meta: { count: filtered.length },
      };

      return HttpResponse.json(response);
    }),
  ];
}
