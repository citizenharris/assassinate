import { ROOM_WEAPONS } from "./data.ts";
import type { GameConfig, Plot, Plots } from "./types.ts";

export function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function titleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Builds the weapon pool from the selected rooms. Each room contributes the
 * weapons that can be *found* there. Weapons are deduped across rooms — they
 * are assigned independently of locations at game time.
 */
export function buildWeaponPool(rooms: readonly string[]): string[] {
  const weapons = new Set<string>();
  for (const room of rooms) {
    const roomWeapons = ROOM_WEAPONS[room];
    if (roomWeapons) {
      for (const weapon of roomWeapons) {
        weapons.add(weapon);
      }
    }
  }
  return [...weapons];
}

export function setup(players: readonly string[], rooms: readonly string[]): Plots {
  if (players.length < 3) {
    throw new Error("At least 3 players are required.");
  }
  if (rooms.length === 0) {
    throw new Error("At least one room is required.");
  }

  const weapons = buildWeaponPool(rooms);
  if (weapons.length === 0) {
    throw new Error("No weapons available for the selected rooms.");
  }

  const shuffledPlayers = shuffle(players);
  const shuffledWeapons = shuffle(weapons);
  const shuffledRooms = shuffle(rooms);

  // Circular victim chain: each player targets the previous in the shuffled order
  const victims: string[] = [
    shuffledPlayers[shuffledPlayers.length - 1],
    ...shuffledPlayers.slice(0, -1),
  ];

  const plots: Record<string, Plot> = {};
  for (let i = 0; i < shuffledPlayers.length; i++) {
    const player = shuffledPlayers[i];
    plots[player] = {
      victim: victims[i],
      // Wrap around so every player gets a weapon/room even if the pool is smaller
      weapon: shuffledWeapons[i % shuffledWeapons.length],
      room: shuffledRooms[i % shuffledRooms.length],
    };
  }

  return plots;
}

export function encodeConfig(config: GameConfig): string {
  const payload: Record<string, unknown> = { players: config.players, rooms: config.rooms };
  if (config.roomNames && Object.keys(config.roomNames).length > 0) {
    payload["roomNames"] = config.roomNames;
  }
  return btoa(JSON.stringify(payload));
}

export function decodeConfig(encoded: string): GameConfig | null {
  try {
    const parsed: unknown = JSON.parse(atob(encoded));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("players" in parsed) ||
      !("rooms" in parsed)
    ) {
      return null;
    }
    const { players, rooms } = parsed as { players: unknown; rooms: unknown };
    if (
      !Array.isArray(players) ||
      !Array.isArray(rooms) ||
      !players.every((p): p is string => typeof p === "string") ||
      !rooms.every((r): r is string => typeof r === "string")
    ) {
      return null;
    }
    const roomNames =
      "roomNames" in (parsed as Record<string, unknown>) &&
      typeof (parsed as Record<string, unknown>)["roomNames"] === "object" &&
      (parsed as Record<string, unknown>)["roomNames"] !== null
        ? ((parsed as Record<string, unknown>)["roomNames"] as Record<string, string>)
        : undefined;
    return { players, rooms, roomNames };
  } catch {
    return null;
  }
}
