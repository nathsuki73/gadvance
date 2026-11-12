import { safeCallbackUrl } from "./safe-redirect";

test("keeps same-site paths with their query and hash", () => {
  expect(safeCallbackUrl("/workspace")).toBe("/workspace");
  expect(safeCallbackUrl("/workspace/organization/join?code=ABC123")).toBe(
    "/workspace/organization/join?code=ABC123",
  );
  expect(safeCallbackUrl("/docs/faq#account")).toBe("/docs/faq#account");
});

test("rejects other sites", () => {
  expect(safeCallbackUrl("https://evil.example/login")).toBeNull();
  expect(safeCallbackUrl("//evil.example")).toBeNull();
  expect(safeCallbackUrl("/\\evil.example")).toBeNull();
  expect(safeCallbackUrl("/\t/evil.example")).toBeNull();
});

test("rejects script and data URLs", () => {
  expect(safeCallbackUrl("javascript:alert(1)")).toBeNull();
  expect(safeCallbackUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
});

test("rejects empty and relative values", () => {
  expect(safeCallbackUrl(null)).toBeNull();
  expect(safeCallbackUrl("")).toBeNull();
  expect(safeCallbackUrl("workspace")).toBeNull();
});
