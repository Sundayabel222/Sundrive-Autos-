/**
 * Join conditional class names. Deliberately dependency-free — we compose
 * Tailwind classes ourselves and don't need conflict resolution, so pulling in
 * clsx + tailwind-merge would be unnecessary weight.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
