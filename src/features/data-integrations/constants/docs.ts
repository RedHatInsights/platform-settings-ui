/**
 * Documentation targets for the Data Integrations feature island.
 *
 * Everything points at the same customer-facing guide, "Configuring cloud
 * integrations for Red Hat services" — the page header's "Learn more" link, the
 * About tab's "Read documentation" button, and the per-provider "Learn more"
 * links on the use-case cards.
 */
export const DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/configuring_cloud_integrations_for_red_hat_services/index';

/**
 * Per-provider deep links into that guide.
 *
 * These are section anchors rather than separate documents. An anchor that no
 * longer resolves degrades to the top of the guide rather than a 404, so a
 * docs restructure downgrades these from precise to merely correct.
 */
export const PROVIDER_DOCS_URLS: Record<string, string> = {
  amazon: `${DOCS_URL}#adding-an-amazon-web-services-integration`,
  azure: `${DOCS_URL}#adding-a-microsoft-azure-integration`,
  google: `${DOCS_URL}#adding-a-google-cloud-integration`,
  openshift: `${DOCS_URL}#adding-an-openshift-container-platform-integration`,
};
