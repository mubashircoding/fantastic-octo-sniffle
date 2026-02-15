const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * Formats a number of bytes into a human-readable size string (e.g. "1.5 MB").
 */
export function formatize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  const decimals = i === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;

  return `${value.toFixed(decimals)} ${UNITS[i]}`;
}
