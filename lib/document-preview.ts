export function getLatestDocument<T>(
  documents: readonly T[] | undefined,
): T | undefined {
  return documents?.at(-1);
}
