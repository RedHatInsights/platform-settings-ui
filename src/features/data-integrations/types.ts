/**
 * Provider identifiers for the data integration types supported in Phase 1.
 *
 * These values intentionally match the `source_type.name` values used by the
 * Sources API (`/api/sources/v3.1/source_types`), so they can be passed
 * straight through to the data layer and the creation wizard without mapping.
 */
export type SourceTypeName = 'amazon' | 'google' | 'azure' | 'openshift';

/** A single entry in the "Add data integration" dropdown. */
export interface IntegrationTypeOption {
  /** Source type name, used as the dropdown item value. */
  value: SourceTypeName;
  /** Translated, user-facing provider name. */
  label: string;
}
