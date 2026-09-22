/**
 * UI-side mapping of source type names to their icon URLs.
 *
 * Icon URLs are UI concerns and not returned by the Sources API.
 * This mapping allows us to display provider icons in the UI based on the
 * source type name returned by the API.
 */
export const SOURCE_TYPE_ICONS: Record<string, string> = {
  amazon: '/apps/frontend-assets/partners-icons/aws-logomark.svg',
  azure: '/apps/frontend-assets/partners-icons/microsoft-azure-logomark.svg',
  google: '/apps/frontend-assets/partners-icons/google-cloud-logomark.svg',
  openshift: '/apps/frontend-assets/technology-icons/openshift.svg',
};

/**
 * Get the icon URL for a source type by its name.
 * Returns undefined if no icon mapping exists.
 */
export function getSourceTypeIcon(sourceTypeName?: string): string | undefined {
  return sourceTypeName ? SOURCE_TYPE_ICONS[sourceTypeName] : undefined;
}
