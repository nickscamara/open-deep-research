export function getForecastStartIndex(
  times: string[],
  currentTime: string,
  hoursToShow: number,
): number {
  const currentTimestamp = new Date(currentTime).getTime();
  const currentTimeIndex = times.findIndex(
    (time) => new Date(time).getTime() >= currentTimestamp,
  );

  if (currentTimeIndex >= 0) {
    return currentTimeIndex;
  }

  return Math.max(0, times.length - hoursToShow);
}
