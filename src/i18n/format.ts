/** Placeholders without a matching key are left as they are. */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    // Own keys only: avoids matching inherited ones such as "constructor".
    if (!Object.hasOwn(values, key)) {
      return match;
    }
    return String(values[key]);
  });
}
