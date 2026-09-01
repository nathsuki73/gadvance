import { getJwtExpiration, shouldRefreshLaravelToken } from "./jwt-helpers";

function makeFakeJwt(expiresInSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  ).toString("base64url");
  return `${header}.${payload}.fakesignature`;
}

test("does not flag refresh when token has 10 min left", () => {
  expect(shouldRefreshLaravelToken(makeFakeJwt(600))).toBe(false);
});

test("flags refresh when token has 2 min left", () => {
  expect(shouldRefreshLaravelToken(makeFakeJwt(120))).toBe(true);
});

test("flags refresh when token is already expired", () => {
  expect(shouldRefreshLaravelToken(makeFakeJwt(-60))).toBe(true);
});

test("returns false for malformed token", () => {
  expect(shouldRefreshLaravelToken("not.a.jwt")).toBe(false);
});

test("returns null expiration for token without exp claim", () => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ sub: "user123" })).toString(
    "base64url",
  );
  const token = `${header}.${payload}.sig`;
  expect(getJwtExpiration(token)).toBeNull();
});
