import equal from 'fast-deep-equal';

export interface DocumentToolCallComparableProps {
  type: string;
  args: unknown;
  isReadonly: boolean;
}

export interface DocumentToolResultComparableProps {
  type: string;
  result: unknown;
  isReadonly: boolean;
}

export function areDocumentToolCallPropsEqual(
  previous: DocumentToolCallComparableProps,
  next: DocumentToolCallComparableProps,
): boolean {
  return (
    previous.type === next.type &&
    equal(previous.args, next.args) &&
    previous.isReadonly === next.isReadonly
  );
}

export function areDocumentToolResultPropsEqual(
  previous: DocumentToolResultComparableProps,
  next: DocumentToolResultComparableProps,
): boolean {
  return (
    previous.type === next.type &&
    equal(previous.result, next.result) &&
    previous.isReadonly === next.isReadonly
  );
}
