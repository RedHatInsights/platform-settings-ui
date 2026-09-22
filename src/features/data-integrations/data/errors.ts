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
