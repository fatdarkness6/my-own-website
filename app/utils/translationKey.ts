// Stable keys let existing canonical content remain the English source of truth.
// Changing a source sentence intentionally creates a new translation key.
export function translationKey(source: string): string {
  let hash = 2166136261;
  for (const character of source) {
    hash ^= character.codePointAt(0)!;
    hash = Math.imul(hash, 16777619);
  }
  return `m_${(hash >>> 0).toString(36)}`;
}
