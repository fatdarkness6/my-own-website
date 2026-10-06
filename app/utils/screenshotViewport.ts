/** Fit the complete image at 1×; larger zoom levels scroll instead of distorting it. */
export function screenshotWidth(width: number, height: number, aspect: number, zoom: number) {
  if (width <= 0 || height <= 0 || aspect <= 0) return 0;
  return Math.min(width, height * aspect) * Math.max(1, Math.min(4, zoom));
}
