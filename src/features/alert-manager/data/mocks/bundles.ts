import { HttpResponse, http } from 'msw';
import type { BundleFacet } from '../types/bundles.types';

export const seedBundles: BundleFacet[] = [
  {
    id: 'b-0001-rhel',
    name: 'rhel',
    displayName: 'Red Hat Enterprise Linux',
  },
  {
    id: 'b-0002-openshift',
    name: 'openshift',
    displayName: 'OpenShift',
  },
  {
    id: 'b-0003-console',
    name: 'console',
    displayName: 'Console',
  },
  {
    id: 'b-0004-iam',
    name: 'iam',
    displayName: 'Identity and Access Management',
  },
];

export function createBundlesHandlers(baseUrl = '/api/notifications/v3') {
  return [
    http.get(`${baseUrl}/notifications/bundles`, () => {
      return HttpResponse.json(
        seedBundles.map(({ displayName, ...bundle }) => ({
          ...bundle,
          display_name: displayName,
        })),
      );
    }),
  ];
}
