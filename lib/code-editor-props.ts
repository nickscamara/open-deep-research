export interface CodeEditorComparableProps {
  content: string;
  saveContent: unknown;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: unknown;
}

export function areCodeEditorPropsEqual(
  previous: CodeEditorComparableProps,
  next: CodeEditorComparableProps,
): boolean {
  if (previous.suggestions !== next.suggestions) return false;
  if (previous.currentVersionIndex !== next.currentVersionIndex) return false;
  if (previous.isCurrentVersion !== next.isCurrentVersion) return false;
  if (previous.status === 'streaming' && next.status === 'streaming')
    return false;
  if (previous.status !== next.status) return false;
  if (previous.content !== next.content) return false;
  if (previous.saveContent !== next.saveContent) return false;

  return true;
}
