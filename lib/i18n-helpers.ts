import type { Locale } from "@/i18n/config";

/**
 * Returns the locale-specific text from a row that has *_mn and *_en columns.
 * Falls back to Mongolian when the English column is empty/null.
 */
export function localized<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale,
): string {
  const key = `${field}_${locale}` as keyof T;
  const value = row[key];
  if (typeof value === "string" && value.length > 0) return value;
  const fallback = row[`${field}_mn` as keyof T];
  return typeof fallback === "string" ? fallback : "";
}
