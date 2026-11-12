#!/usr/bin/env node
/**
 * Builds public/downloads/gadvance-documentation.pdf from /docs/print.
 *
 * Usage: start the app (npm run dev, or npm run build && npm start), then
 *   npm run docs:pdf
 *
 * Options (environment variables):
 *   DOCS_PDF_BASE_URL  where the app is running (default http://localhost:3000)
 *   CHROME_PATH        Chrome or Edge executable, when it is not found automatically
 *
 * Uses the Chrome or Edge already installed on the machine in headless mode,
 * so the project needs no extra dependency. Re-run it after editing any
 * documentation article, and commit the regenerated PDF.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public", "downloads", "gadvance-documentation.pdf");
const baseUrl = (process.env.DOCS_PDF_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const url = `${baseUrl}/docs/print`;

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browser = candidates.find((path) => existsSync(path));
if (!browser) {
  console.error("No Chrome or Edge found. Set CHROME_PATH to the browser executable.");
  process.exit(1);
}

try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch (error) {
  console.error(`Could not load ${url} (${error.message}). Start the app first, or set DOCS_PDF_BASE_URL.`);
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });

const result = spawnSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    // Gives the page time to open the FAQ answers and load every screenshot.
    "--virtual-time-budget=20000",
    `--print-to-pdf=${output}`,
    url,
  ],
  { stdio: "inherit", timeout: 120_000 },
);

if (result.status !== 0 || !existsSync(output)) {
  console.error("The browser did not produce a PDF.");
  process.exit(result.status || 1);
}

console.log(`Wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`);
