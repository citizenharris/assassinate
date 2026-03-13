import type { Page } from "@playwright/test";

/** Fills the player name input and submits. */
export async function addPlayer(page: Page, name: string): Promise<void> {
  await page.locator("#player-input").fill(name);
  await page.locator("#add-player-btn").click();
}

/**
 * Adds the given players and clicks Start Game.
 * Defaults to three players so most tests don't have to care about the names.
 */
export async function startGame(
  page: Page,
  players: string[] = ["Alice", "Bob", "Charlie"]
): Promise<void> {
  for (const player of players) {
    await addPlayer(page, player);
  }
  await page.locator("#start-game-btn").click();
}

/** Fills the name input on the play screen and clicks Claim your victim. */
export async function claimVictim(page: Page, name: string): Promise<void> {
  await page.locator("#name").fill(name);
  await page.locator("#claim-btn").click();
}

/**
 * Encodes a game config as a base64 URL hash the same way the app does,
 * so tests can navigate directly to a pre-configured game URL.
 */
export function buildHash(players: string[], rooms: string[]): string {
  return Buffer.from(JSON.stringify({ players, rooms })).toString("base64");
}
