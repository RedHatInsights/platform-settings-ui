/**
 * Threshold TableView uses to switch a `format: 'date'` column from relative
 * time to an absolute date.
 */
const ABSOLUTE_AFTER_MONTHS = 3;

/**
 * Picks the `DateFormat` type that a TableView `format: 'date'` column would
 * use for the same timestamp.
 *
 * TableView applies this rule internally via `getDateFormat` in
 * `TableView/components/TableViewRow` — relative time until three months old,
 * an absolute date after that. That function is module-private and is not
 * re-exported by the package, and `format: 'date'` is a `ColumnConfig` field,
 * so neither is reachable from the source detail page's DescriptionList.
 *
 * Mirroring it here is what keeps the sources table and the detail page
 * printing the same string for the same source. If frontend-components ever
 * exports the rule (or `DateFormat` grows an automatic type), delete this and
 * call that instead — the behaviour must stay identical either way.
 */
export function getDateFormatType(date: string): 'onlyDate' | 'relative' {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - ABSOLUTE_AFTER_MONTHS);
  return Date.parse(date) < cutoff.getTime() ? 'onlyDate' : 'relative';
}
