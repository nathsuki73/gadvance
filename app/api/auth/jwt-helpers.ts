export function getJwtExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      Buffer.from(normalizedPayload, "base64").toString("utf-8"),
    );

    if (typeof decoded.exp !== "number") return null;
    return decoded.exp;
  } catch {
    return null;
  }
}

export function shouldRefreshLaravelToken(token: string): boolean {
  const expiration = getJwtExpiration(token); // exp in seconds
  if (!expiration) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = expiration - currentTime;
  const refreshThreshold = 15 * 60; // 15 minutes buffer

  return timeRemaining > 0 && timeRemaining <= refreshThreshold;
}
