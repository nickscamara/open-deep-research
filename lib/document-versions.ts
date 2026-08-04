export function getRestoredDocumentVersions<T>(
  documents: readonly T[],
  versionIndex: number,
): T[] {
  if (
    !Number.isInteger(versionIndex) ||
    versionIndex < 0 ||
    versionIndex >= documents.length
  ) {
    return [...documents];
  }

  return documents.slice(0, versionIndex + 1);
}

export async function restoreDocumentVersion<T>(
  documents: readonly T[],
  versionIndex: number,
  requestRestore: () => Promise<{ ok: boolean }>,
): Promise<T[]> {
  const response = await requestRestore();

  if (!response.ok) {
    throw new Error('Failed to restore document version');
  }

  return getRestoredDocumentVersions(documents, versionIndex);
}
