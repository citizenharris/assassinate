import { describe, expect, it } from "vitest";
import { DEFAULT_ROOMS, ROOM_WEAPONS } from "../src/data.ts";
import {
  buildWeaponPool,
  decodeConfig,
  encodeConfig,
  setup,
  shuffle,
  titleCase,
} from "../src/game.ts";

// ── shuffle ───────────────────────────────────────────────────────────────────

describe("shuffle", () => {
  it("returns an array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array reference", () => {
    const input = [1, 2, 3];
    expect(shuffle(input)).not.toBe(input);
  });

  it("handles single-element arrays", () => {
    expect(shuffle(["only"])).toEqual(["only"]);
  });

  it("handles empty arrays", () => {
    expect(shuffle([])).toEqual([]);
  });
});

// ── titleCase ─────────────────────────────────────────────────────────────────

describe("titleCase", () => {
  it("capitalises the first letter of each word", () => {
    expect(titleCase("alice bob")).toBe("Alice Bob");
  });

  it("lowercases everything except the first letter", () => {
    expect(titleCase("JOHN DOE")).toBe("John Doe");
  });

  it("handles single words", () => {
    expect(titleCase("alice")).toBe("Alice");
  });

  it("handles already title-cased input", () => {
    expect(titleCase("Alice")).toBe("Alice");
  });

  it("handles empty string", () => {
    expect(titleCase("")).toBe("");
  });
});

// ── buildWeaponPool ───────────────────────────────────────────────────────────

describe("buildWeaponPool", () => {
  it("returns weapons for known rooms", () => {
    const pool = buildWeaponPool(["Kitchen"]);
    expect(pool.length).toBeGreaterThan(0);
    // Every item should be a string from the Kitchen entry
    for (const weapon of pool) {
      expect(ROOM_WEAPONS["Kitchen"]).toContain(weapon);
    }
  });

  it("deduplicates weapons that appear in multiple rooms", () => {
    // "a wine bottle" appears in both Kitchen and Dining Room
    const pool = buildWeaponPool(["Kitchen", "Dining Room"]);
    const unique = new Set(pool);
    expect(unique.size).toBe(pool.length);
  });

  it("returns an empty array for unknown/custom rooms", () => {
    expect(buildWeaponPool(["Dungeon"])).toEqual([]);
  });

  it("combines weapons from multiple rooms", () => {
    const kitchenPool = buildWeaponPool(["Kitchen"]);
    const bathroomPool = buildWeaponPool(["Bathroom"]);
    const combined = buildWeaponPool(["Kitchen", "Bathroom"]);
    expect(combined.length).toBeGreaterThanOrEqual(
      Math.max(kitchenPool.length, bathroomPool.length)
    );
  });

  it("returns weapons for all default rooms", () => {
    const pool = buildWeaponPool(DEFAULT_ROOMS);
    expect(pool.length).toBeGreaterThan(0);
  });
});

// ── setup ─────────────────────────────────────────────────────────────────────

describe("setup", () => {
  const players = ["Alice", "Bob", "Charlie"];
  const rooms = ["Kitchen", "Bedroom"];

  it("throws if fewer than 3 players are provided", () => {
    expect(() => setup(["Alice", "Bob"], rooms)).toThrow("3 players");
  });

  it("throws if no rooms are provided", () => {
    expect(() => setup(players, [])).toThrow("room");
  });

  it("returns a plots object with an entry for every player", () => {
    const plots = setup(players, rooms);
    expect(Object.keys(plots)).toHaveLength(players.length);
    for (const name of players) {
      expect(plots).toHaveProperty(name);
    }
  });

  it("assigns each player a victim, weapon, and room", () => {
    const plots = setup(players, rooms);
    // setup() guarantees every player has an entry; non-null assertions are safe here
    for (const plot of Object.values(plots)) {
      expect(typeof plot!.victim).toBe("string");
      expect(typeof plot!.weapon).toBe("string");
      expect(typeof plot!.room).toBe("string");
    }
  });

  it("creates a circular victim chain — every player is someone's victim", () => {
    const plots = setup(players, rooms);
    const victims = Object.values(plots).map((p) => p!.victim);
    for (const name of players) {
      expect(victims).toContain(name);
    }
  });

  it("ensures each victim appears exactly once", () => {
    const plots = setup(players, rooms);
    const victims = Object.values(plots).map((p) => p!.victim);
    expect(new Set(victims).size).toBe(victims.length);
  });

  it("never assigns a player as their own victim", () => {
    const plots = setup(players, rooms);
    for (const [name, plot] of Object.entries(plots)) {
      expect(plot!.victim).not.toBe(name);
    }
  });

  it("assigns weapons from the derived pool only", () => {
    const plots = setup(players, rooms);
    const pool = buildWeaponPool(rooms);
    for (const plot of Object.values(plots)) {
      expect(pool).toContain(plot!.weapon);
    }
  });

  it("assigns rooms from the provided list only", () => {
    const plots = setup(players, rooms);
    for (const plot of Object.values(plots)) {
      expect(rooms).toContain(plot!.room);
    }
  });

  it("works with larger player groups", () => {
    const bigGroup = ["Alice", "Bob", "Charlie", "Diana", "Ed", "Fiona", "George"];
    const plots = setup(bigGroup, DEFAULT_ROOMS);
    expect(Object.keys(plots)).toHaveLength(bigGroup.length);
    const victims = Object.values(plots).map((p) => p!.victim);
    expect(new Set(victims).size).toBe(bigGroup.length);
  });
});

// ── encodeConfig / decodeConfig ───────────────────────────────────────────────

describe("encodeConfig / decodeConfig", () => {
  const config = { players: ["Alice", "Bob", "Charlie"], rooms: ["Kitchen", "Garden"] };

  it("round-trips a valid config", () => {
    const encoded = encodeConfig(config);
    const decoded = decodeConfig(encoded);
    expect(decoded).toEqual(config);
  });

  it("returns null for an empty string", () => {
    expect(decodeConfig("")).toBeNull();
  });

  it("returns null for non-base64 garbage", () => {
    expect(decodeConfig("not-valid-base64!!!!")).toBeNull();
  });

  it("returns null for valid base64 that isn't the right shape", () => {
    const bad = btoa(JSON.stringify({ foo: "bar" }));
    expect(decodeConfig(bad)).toBeNull();
  });

  it("returns null when player array contains non-strings", () => {
    const bad = btoa(JSON.stringify({ players: [1, 2, 3], rooms: ["Kitchen"] }));
    expect(decodeConfig(bad)).toBeNull();
  });

  it("round-trips a config with roomNames", () => {
    const withNames = {
      players: ["Alice", "Bob", "Charlie"],
      rooms: ["Kitchen", "Garden"],
      roomNames: { Garden: "Outside", Kitchen: "Cook House" },
    };
    const encoded = encodeConfig(withNames);
    const decoded = decodeConfig(encoded);
    expect(decoded).toEqual(withNames);
  });

  it("omits roomNames from encoded payload when empty", () => {
    const encoded = encodeConfig({ ...config, roomNames: {} });
    const raw = JSON.parse(atob(encoded)) as Record<string, unknown>;
    expect(raw).not.toHaveProperty("roomNames");
  });

  it("decodes a config without roomNames as undefined", () => {
    const encoded = encodeConfig(config);
    const decoded = decodeConfig(encoded);
    expect(decoded?.roomNames).toBeUndefined();
  });
});

// ── room renaming does not affect weapon pool ────────────────────────────────

describe("room renaming and weapon pool", () => {
  it("buildWeaponPool uses the original room key, not a display name", () => {
    // The weapon pool is keyed on original room names in ROOM_WEAPONS.
    // Even if the UI tracks a rename like Garden → Outside, the
    // selectedRooms array still contains "Garden" so weapons resolve.
    const pool = buildWeaponPool(["Garden"]);
    expect(pool.length).toBeGreaterThan(0);
    // A renamed display name would not match any key in ROOM_WEAPONS
    expect(buildWeaponPool(["Outside"])).toEqual([]);
  });

  it("setup assigns rooms using original keys regardless of display names", () => {
    const players = ["Alice", "Bob", "Charlie"];
    const rooms = ["Kitchen", "Garden"];
    const plots = setup(players, rooms);
    for (const plot of Object.values(plots)) {
      expect(rooms).toContain(plot!.room);
    }
  });
});
