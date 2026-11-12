/**
 * Validates a post-sign-in destination taken from the URL.
 *
 * `callbackUrl` is attacker-controlled: anyone can send a learner a sign-in
 * link with their own value. Only same-site paths are allowed, so the value
 * can never send the learner to another site or run a `javascript:` URL.
 *
 * Returns the path (with its query and hash) when it is safe, otherwise null.
 */
export function safeCallbackUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  // Must be a rooted path. "//host" and "/\host" are treated by browsers as
  // another origin; control characters are stripped by URL parsers, which
  // would let "/\t/host" through a naive check.
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return null;

  try {
    const base = "https://gadvance.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
