import { expect, test } from "@playwright/test";
import { buildHash, claimVictim } from "./helpers.ts";

const PLAYERS = ["Alice", "Bob", "Charlie"];
const ROOMS = ["Kitchen", "Bedroom", "Garden"];

test.describe("URL hash sharing", () => {
  // ── Valid hash ────────────────────────────────────────────────────────────

  test("valid hash skips setup and shows play screen directly", async ({ page }) => {
    const hash = buildHash(PLAYERS, ROOMS);
    await page.goto(`/#${hash}`);
    await expect(page.locator("#play-screen")).toBeVisible();
    await expect(page.locator("#setup-screen")).toBeHidden();
  });

  test("players encoded in the hash can claim their victim", async ({ page }) => {
    const hash = buildHash(PLAYERS, ROOMS);
    await page.goto(`/#${hash}`);

    for (const name of PLAYERS) {
      await claimVictim(page, name);
      await expect(page.locator("#result")).toHaveClass(/show/);
      await page.locator("#clear-btn").click();
    }
  });

  test("encoded rooms determine the weapon pool", async ({ page }) => {
    // Use only rooms that contribute known weapons so we can assert the weapon
    // is something real, not a DOM placeholder
    const hash = buildHash(PLAYERS, ["Kitchen"]);
    await page.goto(`/#${hash}`);
    await claimVictim(page, "Alice");
    const text = await page.locator("#assignment").innerText();
    // Assignment should contain a weapon string (not empty / undefined)
    expect(text.length).toBeGreaterThan(20);
  });

  // ── Invalid / malformed hashes ─────────────────────────────────────────────

  test("invalid base64 falls back to setup screen", async ({ page }) => {
    await page.goto("/#this-is-not-base64!!!");
    await expect(page.locator("#setup-screen")).toBeVisible();
    await expect(page.locator("#play-screen")).toBeHidden();
  });

  test("valid base64 with wrong JSON shape falls back to setup screen", async ({ page }) => {
    const bad = Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64");
    await page.goto(`/#${bad}`);
    await expect(page.locator("#setup-screen")).toBeVisible();
  });

  test("valid base64 with non-string players falls back to setup screen", async ({
    page,
  }) => {
    const bad = Buffer.from(
      JSON.stringify({ players: [1, 2, 3], rooms: ["Kitchen"] })
    ).toString("base64");
    await page.goto(`/#${bad}`);
    await expect(page.locator("#setup-screen")).toBeVisible();
  });

  test("empty hash shows setup screen", async ({ page }) => {
    await page.goto("/#");
    await expect(page.locator("#setup-screen")).toBeVisible();
  });

  test("hash with fewer than 3 players shows setup error", async ({ page }) => {
    const hash = buildHash(["Alice", "Bob"], ROOMS);
    await page.goto(`/#${hash}`);
    // startGame is called but fails validation → stays on setup with error
    await expect(page.locator("#setup-error")).toContainText("3 players");
    await expect(page.locator("#setup-screen")).toBeVisible();
  });

  // ── Copy game link ─────────────────────────────────────────────────────────

  test("copy link button changes text to Copied! as feedback", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    // Add 3 players so the button works
    await page.locator("#player-input").fill("Alice");
    await page.locator("#add-player-btn").click();
    await page.locator("#player-input").fill("Bob");
    await page.locator("#add-player-btn").click();
    await page.locator("#player-input").fill("Charlie");
    await page.locator("#add-player-btn").click();

    await page.locator("#copy-link-btn").click();
    await expect(page.locator("#copy-link-btn")).toHaveText("Copied!");
  });

  test("copy link button reverts to original text after 2 seconds", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    await page.locator("#player-input").fill("Alice");
    await page.locator("#add-player-btn").click();
    await page.locator("#player-input").fill("Bob");
    await page.locator("#add-player-btn").click();
    await page.locator("#player-input").fill("Charlie");
    await page.locator("#add-player-btn").click();

    await page.locator("#copy-link-btn").click();
    await expect(page.locator("#copy-link-btn")).toHaveText("Copied!");
    await expect(page.locator("#copy-link-btn")).toHaveText("Copy game link", {
      timeout: 3000,
    });
  });

  test("copied link contains a valid hash that loads the game", async ({ page }) => {
    // navigator.clipboard.writeText is non-writable on Clipboard.prototype, so
    // a plain assignment silently fails. Override via Object.defineProperty instead,
    // storing the written text in a window global we can read back after the click.
    await page.addInitScript(() => {
      Object.defineProperty(Clipboard.prototype, "writeText", {
        configurable: true,
        value: async function (text: string) {
          (window as Window & { __lastClipboard?: string }).__lastClipboard = text;
          return Promise.resolve();
        },
      });
    });

    await page.goto("/");
    for (const name of ["Alice", "Bob", "Charlie"]) {
      await page.locator("#player-input").fill(name);
      await page.locator("#add-player-btn").click();
    }

    await page.locator("#copy-link-btn").click();
    await expect(page.locator("#copy-link-btn")).toHaveText("Copied!");

    const capturedUrl = await page.evaluate(
      () => (window as Window & { __lastClipboard?: string }).__lastClipboard ?? ""
    );
    expect(capturedUrl).toContain("#");

    // page.goto with only a hash change is treated by the browser as a fragment
    // navigation (no page reload), so DOMContentLoaded never fires and
    // loadFromHash() is never called. Navigate via about:blank to force a full load.
    await page.goto("about:blank");
    await page.goto(capturedUrl);
    await expect(page.locator("#play-screen")).toBeVisible();
  });
});
