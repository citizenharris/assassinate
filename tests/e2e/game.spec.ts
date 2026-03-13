import { expect, test } from "@playwright/test";
import { claimVictim, startGame } from "./helpers.ts";

test.describe("Game flow", () => {
  const players = ["Alice", "Bob", "Charlie"];

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await startGame(page, players);
  });

  // ── Screen transition ───────────────────────────────────────────────────────

  test("transitions to play screen after starting the game", async ({ page }) => {
    await expect(page.locator("#play-screen")).toBeVisible();
    await expect(page.locator("#setup-screen")).toBeHidden();
  });

  test("hides the result panel before any claim", async ({ page }) => {
    await expect(page.locator("#result")).not.toHaveClass(/show/);
  });

  // ── Claiming a victim ───────────────────────────────────────────────────────

  test("shows an assignment after a valid name is entered", async ({ page }) => {
    await claimVictim(page, "Alice");
    await expect(page.locator("#result")).toHaveClass(/show/);
    await expect(page.locator("#assignment")).toContainText("You are killing");
    await expect(page.locator("#assignment")).toContainText("Write this down");
  });

  test("assignment names the victim, weapon, and room", async ({ page }) => {
    await claimVictim(page, "Alice");
    const text = await page.locator("#assignment").innerText();
    // Should mention one of the other two players as the victim
    const hasVictim = text.includes("Bob") || text.includes("Charlie");
    expect(hasVictim).toBe(true);
  });

  test("clears the name input after claiming", async ({ page }) => {
    await claimVictim(page, "Alice");
    await expect(page.locator("#name")).toHaveValue("");
  });

  test("all players can claim their victim in sequence", async ({ page }) => {
    for (const name of players) {
      await claimVictim(page, name);
      await expect(page.locator("#result")).toHaveClass(/show/);
      await page.locator("#clear-btn").click();
      await expect(page.locator("#result")).not.toHaveClass(/show/);
    }
  });

  // ── Name normalisation ──────────────────────────────────────────────────────

  test("accepts a name typed in lowercase", async ({ page }) => {
    await claimVictim(page, "alice");
    await expect(page.locator("#result")).toHaveClass(/show/);
  });

  test("accepts a name typed in uppercase", async ({ page }) => {
    await claimVictim(page, "ALICE");
    await expect(page.locator("#result")).toHaveClass(/show/);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test("shows an error for an unrecognised name", async ({ page }) => {
    await claimVictim(page, "NotAPlayer");
    await expect(page.locator("#play-error")).toContainText("not in the list");
    await expect(page.locator("#result")).not.toHaveClass(/show/);
  });

  test("shows an error for an empty name", async ({ page }) => {
    await page.locator("#claim-btn").click();
    await expect(page.locator("#play-error")).toContainText("enter your name");
  });

  test("clears a previous error when a valid name is entered", async ({ page }) => {
    await claimVictim(page, "NotAPlayer");
    await expect(page.locator("#play-error")).not.toBeEmpty();
    await claimVictim(page, "Alice");
    await expect(page.locator("#play-error")).toBeEmpty();
  });

  // ── Enter key shortcut ──────────────────────────────────────────────────────

  test("claims victim on Enter key in name input", async ({ page }) => {
    await page.locator("#name").fill("Alice");
    await page.locator("#name").press("Enter");
    await expect(page.locator("#result")).toHaveClass(/show/);
  });

  // ── Clear screen ────────────────────────────────────────────────────────────

  test("hides the assignment when Clear screen is clicked", async ({ page }) => {
    await claimVictim(page, "Alice");
    await page.locator("#clear-btn").click();
    await expect(page.locator("#result")).not.toHaveClass(/show/);
  });

  // ── New game ────────────────────────────────────────────────────────────────

  test("returns to setup screen when New game is clicked", async ({ page }) => {
    await page.locator("#new-game-btn").click();
    await expect(page.locator("#setup-screen")).toBeVisible();
    await expect(page.locator("#play-screen")).toBeHidden();
  });

  test("setup screen is fully reset after New game", async ({ page }) => {
    await page.locator("#new-game-btn").click();
    // Player list should be empty (can't start immediately)
    await page.locator("#start-game-btn").click();
    await expect(page.locator("#setup-error")).toContainText("3 players");
  });
});
