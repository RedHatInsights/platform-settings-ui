/**
 * Wire types for the Sources API (`/api/sources/v3.1`).
 *
 * These deliberately do not re-export `@redhat-cloud-services/sources-client`'s
 * generated types. Every field on those is optional — including `id` — which
 * would push a `?.` onto every read in every consumer. The fields the API
 * always returns are required here, and the api layer narrows the generated
 * shapes to these.
 */

/**
 * Reported by the availability checker, which runs asynchronously after a
 * source is created. Absent on a source it has not reached yet.
 */
export type SourceAvailabilityStatus =
  | 'available'
  | 'in_progress'
  | 'partially_available'
  | 'unavailable';

/**
 * A Red Hat service attached to a {@link Source} — Cost Management, RHEL
 * management, and so on. Returned inline by the GraphQL list query; over REST
 * it is a separate collection at `/sources/{id}/applications`.
 *
 * `application_type_id` is a foreign key into `/application_types`, which is
 * where the display name lives.
 */
export interface SourceApplication {
  id: string;
  application_type_id: string;
  availability_status?: SourceAvailabilityStatus;
  availability_status_error?: string;
  paused_at?: string;
}

export interface Source {
  id: string;
  name: string;
  /** Foreign key into {@link SourceType}, not the provider name. */
  source_type_id: string;
  created_at: string;
  updated_at?: string;
  availability_status?: SourceAvailabilityStatus;
  /**
   * Only populated by {@link Source} detail reads. The GraphQL schema does not
   * expose this at the source level — on the list, the error text lives on the
   * individual {@link SourceApplication}.
   */
  availability_status_error?: string;
  /** Set while the source is paused; `undefined` means active. */
  paused_at?: string;
  last_checked_at?: string;
  last_available_at?: string;
  app_creation_workflow?: 'manual_configuration' | 'account_authorization';
  imported?: string;
  source_ref?: string;
  /** Detail reads only — not exposed by the GraphQL schema. */
  uid?: string;
  /** Detail reads only — not exposed by the GraphQL schema. */
  version?: string;
  /** Populated by the list query; absent on detail reads. */
  applications?: SourceApplication[];
}

export interface SourceType {
  id: string;
  /**
   * Stable provider identifier — `amazon`, `azure`, `google`, `openshift`, and
   * others this island does not offer. Typed as `string` rather than
   * `SourceTypeName` because the API returns the full set.
   */
  name: string;
  product_name?: string;
  vendor?: string;
  icon_url?: string;
  /** `Cloud` or `Red Hat` — the grouping the add-integration dropdown uses. */
  category?: string;
}

export interface CollectionLinks {
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

export interface CollectionMeta {
  count: number;
  limit?: number;
  offset?: number;
}

export interface PageSource {
  data: Source[];
  links: CollectionLinks;
  meta: CollectionMeta;
}

export interface PageSourceType {
  data: SourceType[];
  links: CollectionLinks;
  meta: CollectionMeta;
}

/**
 * Ergonomic parameters for {@link Source} listing. The api layer translates
 * these into the query params the API expects — callers never write
 * `filter[...]` keys or assemble the `sort_by` value themselves.
 */
export interface SourcesParams {
  limit?: number;
  offset?: number;
  /**
   * Column to sort on. A `source_type.` prefix sorts on the joined provider
   * catalogue — `source_type.product_name` is how the table's "Type" column
   * sorts by display name rather than by the meaningless foreign key.
   */
  sortBy?: string;
  /** Defaults to `asc` when {@link SourcesParams.sortBy} is set. */
  sortDirection?: 'asc' | 'desc';
  /** Case-insensitive substring match on the name (`contains_i`). */
  nameContains?: string;
  /** Restrict to these source type ids. */
  sourceTypeIds?: string[];
  /** Restrict to these availability statuses. */
  availabilityStatus?: SourceAvailabilityStatus[];
  /**
   * Restrict to sources with one of these applications attached. Filters on
   * the joined `applications` association.
   */
  applicationTypeIds?: string[];
}
