export const CONSOLE_MIN_HEIGHT = 100;
export const CONSOLE_MAX_HEIGHT = 800;
export const CONSOLE_DEFAULT_HEIGHT = 300;
export const CONSOLE_HEIGHT_STEP = 20;

export function getConsoleHeightForKey(
  currentHeight: number,
  key: string,
): number {
  switch (key) {
    case 'ArrowUp':
    case 'ArrowRight':
      return Math.min(CONSOLE_MAX_HEIGHT, currentHeight + CONSOLE_HEIGHT_STEP);
    case 'ArrowDown':
    case 'ArrowLeft':
      return Math.max(CONSOLE_MIN_HEIGHT, currentHeight - CONSOLE_HEIGHT_STEP);
    case 'Home':
      return CONSOLE_MIN_HEIGHT;
    case 'End':
      return CONSOLE_MAX_HEIGHT;
    default:
      return currentHeight;
  }
}
