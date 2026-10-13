/**
 * Custom error class for when a source is not found.
 * Thrown by getSource() when the query returns zero results.
 */
export class SourceNotFoundError extends Error {
  constructor(sourceId: string) {
    super(`Source not found: ${sourceId}`);
    this.name = 'SourceNotFoundError';
  }
}

/**
 * Pulls the human-readable reason out of a rejected Sources request.
 *
 * `sources-api-go` answers a failed write with `{ errors: [{ detail, status }] }`,
 * which is where the useful text lives — "Name has already been taken" rather
 * than the axios message's "Request failed with status code 400". Returns
 * `undefined` when the response is not in that shape (a network failure, or an
 * error page from something in front of the API), leaving the caller to fall
 * back to generic copy.
 */
export function extractSourcesErrorDetail(error: unknown): string | undefined {
  const data = (
    error as { response?: { data?: { errors?: Array<{ detail?: string }> } } }
  )?.response?.data;

  const detail = data?.errors?.find((entry) => entry?.detail)?.detail;

  return detail?.trim() || undefined;
}
