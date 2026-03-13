import { expect, test } from "@playwright/test";
import { addPlayer } from "./helpers.ts";

test.describe("Setup screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Screen visibility ───────────────────────────────────────────────────────

  test("shows setup screen and hides play screen on load", async ({ page }) => {
    await expect(page.locator("#setup-screen")).toBeVisible();
    await expect(page.locator("#play-screen")).toBeHidden();
  });

  // ── Adding players ──────────────────────────────────────────────────────────

  test("adds a player to the list on button click", async ({ page }) => {
    await addPlayer(page, "Alice");
    await expect(page.locator("#player-list")).toContainText("Alice");
  });

  test("adds a player to the list on Enter key", async ({ page }) => {
    await page.locator("#player-input").fill("Bob");
    await page.locator("#player-input").press("Enter");
    await expect(page.locator("#player-list")).toContainText("Bob");
  });

  test("normalises input to title case", async ({ page }) => {
    await addPlayer(page, "alice smith");
    await expect(page.locator("#player-list")).toContainText("Alice Smith");
  });

  test("clears the input after a player is added", async ({ page }) => {
    await addPlayer(page, "Charlie");
    await expect(page.locator("#player-input")).toHaveValue("");
  });

  test("rejects a duplicate player name", async ({ page }) => {
    await addPlayer(page, "Alice");
    await addPlayer(page, "Alice");
    await expect(page.locator("#player-error")).toContainText("already in the list");
    // Still only one entry
    await expect(page.locator(".tag-item")).toHaveCount(1);
  });

  test("ignores an empty submission", async ({ page }) => {
    await page.locator("#add-player-btn").click();
    await expect(page.locator(".tag-item")).toHaveCount(0);
  });

  // ── Removing players ────────────────────────────────────────────────────────

  test("removes a player when × is clicked", async ({ page }) => {
    await addPlayer(page, "Alice");
    await addPlayer(page, "Bob");
    await page.locator(".tag-item").filter({ hasText: "Alice" }).locator(".tag-remove").click();
    await expect(page.locator("#player-list")).not.toContainText("Alice");
    await expect(page.locator("#player-list")).toContainText("Bob");
  });

  // ── Player count hint ───────────────────────────────────────────────────────

  test("shows a warning hint with fewer than 3 players", async ({ page }) => {
    await addPlayer(page, "Alice");
    await expect(page.locator("#player-count")).toHaveClass(/hint--warn/);
    await expect(page.locator("#player-count")).toContainText("need");
  });

  test("shows an ok hint once 3 or more players are added", async ({ page }) => {
    await addPlayer(page, "Alice");
    await addPlayer(page, "Bob");
    await addPlayer(page, "Charlie");
    await expect(page.locator("#player-count")).toHaveClass(/hint--ok/);
    await expect(page.locator("#player-count")).toContainText("ready");
  });

  // ── Room chips ──────────────────────────────────────────────────────────────

  test("renders default rooms as active chips on load", async ({ page }) => {
    const activeChips = page.locator(".chip--active");
    await expect(activeChips).toHaveCount(8); // DEFAULT_ROOMS has 8 entries
  });

  test("deselects a room chip when clicked", async ({ page }) => {
    const kitchen = page.locator('.chip[data-room="Kitchen"]');
    await expect(kitchen).toHaveClass(/chip--active/);
    await kitchen.click();
    await expect(kitchen).not.toHaveClass(/chip--active/);
  });

  test("re-selects a room chip when clicked again", async ({ page }) => {
    const kitchen = page.locator('.chip[data-room="Kitchen"]');
    await kitchen.click(); // deselect
    await kitchen.click(); // re-select
    await expect(kitchen).toHaveClass(/chip--active/);
  });

  test("weapon count reflects selected rooms", async ({ page }) => {
    await expect(page.locator("#weapon-count")).toHaveClass(/hint--ok/);
    await expect(page.locator("#weapon-count")).toContainText("weapons in the pool");
  });

  // ── Custom rooms ────────────────────────────────────────────────────────────

  test("adds a custom room on button click", async ({ page }) => {
    await page.locator("#room-input").fill("Wine Cellar");
    await page.locator("#add-room-btn").click();
    await expect(page.locator('.chip[data-room="Wine Cellar"]')).toBeVisible();
  });

  test("adds a custom room on Enter key", async ({ page }) => {
    await page.locator("#room-input").fill("Attic");
    await page.locator("#room-input").press("Enter");
    await expect(page.locator('.chip[data-room="Attic"]')).toBeVisible();
  });

  test("custom room chip is visually distinct (dashed border)", async ({ page }) => {
    await page.locator("#room-input").fill("Dungeon");
    await page.locator("#add-room-btn").click();
    await expect(page.locator('.chip[data-room="Dungeon"]')).toHaveClass(/chip--custom/);
  });

  test("removes a custom room when its chip is clicked", async ({ page }) => {
    await page.locator("#room-input").fill("Dungeon");
    await page.locator("#add-room-btn").click();
    await page.locator('.chip[data-room="Dungeon"]').click();
    await expect(page.locator('.chip[data-room="Dungeon"]')).toHaveCount(0);
  });

  test("rejects a duplicate custom room", async ({ page }) => {
    await page.locator("#room-input").fill("Attic");
    await page.locator("#add-room-btn").click();
    await page.locator("#room-input").fill("Attic");
    await page.locator("#add-room-btn").click();
    await expect(page.locator("#room-error")).toContainText("already included");
  });

  // ── Start game validation ───────────────────────────────────────────────────

  test("blocks game start with fewer than 3 players", async ({ page }) => {
    await addPlayer(page, "Alice");
    await addPlayer(page, "Bob");
    await page.locator("#start-game-btn").click();
    await expect(page.locator("#setup-error")).toContainText("3 players");
    await expect(page.locator("#setup-screen")).toBeVisible();
  });

  test("blocks game start with zero players", async ({ page }) => {
    await page.locator("#start-game-btn").click();
    await expect(page.locator("#setup-error")).toContainText("3 players");
  });
});
