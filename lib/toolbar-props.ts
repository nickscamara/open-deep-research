export interface ToolbarComparableProps {
  isToolbarVisible: boolean;
  setIsToolbarVisible: unknown;
  isLoading: boolean;
  append: unknown;
  stop: unknown;
  setMessages: unknown;
  blockKind: string;
}

export function areToolbarPropsEqual(
  previous: ToolbarComparableProps,
  next: ToolbarComparableProps,
): boolean {
  return (
    previous.isToolbarVisible === next.isToolbarVisible &&
    previous.setIsToolbarVisible === next.setIsToolbarVisible &&
    previous.isLoading === next.isLoading &&
    previous.append === next.append &&
    previous.stop === next.stop &&
    previous.setMessages === next.setMessages &&
    previous.blockKind === next.blockKind
  );
}
