import { beforeEach, describe, expect, it } from "vitest";
import { ROOM_WEAPONS } from "../src/data.ts";
import {
  ROOM_IT,
  WEAPON_IT,
  d,
  getLang,
  setLang,
  t,
  translateRoom,
  translateWeapon,
} from "../src/i18n.ts";

// Reset language before each test so tests don't bleed into each other
beforeEach(() => { setLang("en"); });

// ── getLang / setLang ─────────────────────────────────────────────────────────

describe("getLang / setLang", () => {
  it("defaults to English", () => {
    expect(getLang()).toBe("en");
  });

  it("switches to Italian", () => {
    setLang("it");
    expect(getLang()).toBe("it");
  });

  it("switches back to English", () => {
    setLang("it");
    setLang("en");
    expect(getLang()).toBe("en");
  });
});

// ── t() ───────────────────────────────────────────────────────────────────────

describe("t()", () => {
  it("returns English strings by default", () => {
    expect(t("startGameBtn")).toBe("Start Game");
    expect(t("claimBtn")).toBe("Claim your victim");
    expect(t("copyLinkBtn")).toBe("Copy game link");
  });

  it("returns Italian strings after setLang('it')", () => {
    setLang("it");
    expect(t("startGameBtn")).toBe("Inizia la partita");
    expect(t("claimBtn")).toBe("Rivendica la tua vittima");
    expect(t("copyLinkBtn")).toBe("Copia link partita");
  });

  it("returns different strings for EN and IT", () => {
    const en = t("rulesTitle");
    setLang("it");
    const it = t("rulesTitle");
    expect(en).not.toBe(it);
  });

  it("returns non-empty strings for every key in both languages", () => {
    const keys: Parameters<typeof t>[0][] = [
      "title", "h1", "playersHeading", "playerInputPlaceholder",
      "addPlayerBtn", "roomsHeading", "roomsDescription", "roomInputPlaceholder",
      "addRoomBtn", "startGameBtn", "copyLinkBtn", "rulesTitle",
      "rule1", "rule2", "rule3", "rule4", "rule5",
      "encouragement", "playLabel", "nameInputPlaceholder",
      "claimBtn", "clearBtn", "newGameBtn",
      "muteAriaLabel", "unmuteAriaLabel",
      "noPlayersYet", "addAtLeast3", "noWeaponsAvailable",
      "needAtLeast3", "needAtLeastOneRoom", "noWeaponsSetupError",
      "enterYourName", "nameNotInList", "addPlayersBeforeCopying",
      "copied", "resultFooter",
    ];
    for (const lang of ["en", "it"] as const) {
      setLang(lang);
      for (const key of keys) {
        expect(t(key), `${lang}.${key} should be a non-empty string`).toBeTruthy();
      }
    }
  });
});

// ── d() dynamic translations ──────────────────────────────────────────────────

describe("d().playerCountWarn()", () => {
  it("mentions the shortfall in English", () => {
    expect(d().playerCountWarn(1)).toContain("need 2 more");
    expect(d().playerCountWarn(2)).toContain("need 1 more");
  });

  it("mentions the shortfall in Italian", () => {
    setLang("it");
    expect(d().playerCountWarn(1)).toContain("2");
    expect(d().playerCountWarn(2)).toContain("1");
  });
});

describe("d().playerCountOk()", () => {
  it("English — singular vs plural", () => {
    expect(d().playerCountOk(1)).toContain("player");
    expect(d().playerCountOk(3)).toContain("players");
  });

  it("Italian — singular vs plural", () => {
    setLang("it");
    expect(d().playerCountOk(1)).toMatch(/giocatore/i);
    expect(d().playerCountOk(3)).toMatch(/giocatori/i);
  });

  it("includes the player count", () => {
    expect(d().playerCountOk(5)).toContain("5");
    setLang("it");
    expect(d().playerCountOk(5)).toContain("5");
  });
});

describe("d().removeAriaLabel()", () => {
  it("includes the player name in English", () => {
    expect(d().removeAriaLabel("Alice")).toBe("Remove Alice");
  });

  it("includes the player name in Italian", () => {
    setLang("it");
    expect(d().removeAriaLabel("Alice")).toBe("Rimuovi Alice");
  });
});

describe("d().playerAlreadyInList()", () => {
  it("includes the player name in English", () => {
    expect(d().playerAlreadyInList("Bob")).toContain("Bob");
    expect(d().playerAlreadyInList("Bob")).toContain("already");
  });

  it("includes the player name in Italian", () => {
    setLang("it");
    expect(d().playerAlreadyInList("Bob")).toContain("Bob");
    expect(d().playerAlreadyInList("Bob")).toContain("già");
  });
});

describe("d().weaponCount()", () => {
  it("English — singular vs plural", () => {
    expect(d().weaponCount(1)).toContain("weapon");
    expect(d().weaponCount(3)).toContain("weapons");
  });

  it("Italian — singular vs plural", () => {
    setLang("it");
    expect(d().weaponCount(1)).toMatch(/arma/i);
    expect(d().weaponCount(3)).toMatch(/armi/i);
  });
});

describe("d().roomAlreadyIncluded()", () => {
  it("includes the room name in English", () => {
    expect(d().roomAlreadyIncluded("Kitchen")).toContain("Kitchen");
  });

  it("includes the room name in Italian", () => {
    setLang("it");
    expect(d().roomAlreadyIncluded("Cucina")).toContain("Cucina");
  });
});

describe("d().assignment()", () => {
  it("English — contains victim, weapon, room", () => {
    const html = d().assignment("Alice", "a frying pan", "Kitchen");
    expect(html).toContain("Alice");
    expect(html).toContain("a frying pan");
    expect(html).toContain("kitchen"); // lowercased in English
  });

  it("Italian — contains victim, weapon, room without lowercasing", () => {
    setLang("it");
    const html = d().assignment("Alice", "una padella", "Cucina");
    expect(html).toContain("Alice");
    expect(html).toContain("una padella");
    expect(html).toContain("Cucina");
  });
});

// ── translateRoom() ───────────────────────────────────────────────────────────

describe("translateRoom()", () => {
  it("returns the English name unchanged in EN mode", () => {
    expect(translateRoom("Kitchen")).toBe("Kitchen");
    expect(translateRoom("Living Room")).toBe("Living Room");
  });

  it("returns the Italian name in IT mode", () => {
    setLang("it");
    expect(translateRoom("Kitchen")).toBe("Cucina");
    expect(translateRoom("Living Room")).toBe("Soggiorno");
    expect(translateRoom("Bathroom")).toBe("Bagno");
    expect(translateRoom("Bedroom")).toBe("Camera da Letto");
    expect(translateRoom("Garden")).toBe("Giardino");
    expect(translateRoom("Hallway")).toBe("Ingresso");
    expect(translateRoom("Dining Room")).toBe("Sala da Pranzo");
    expect(translateRoom("Stairs")).toBe("Scale");
  });

  it("falls back to the original string for unknown rooms", () => {
    setLang("it");
    expect(translateRoom("Dungeon")).toBe("Dungeon");
  });

  it("covers every room in ROOM_WEAPONS", () => {
    setLang("it");
    for (const room of Object.keys(ROOM_WEAPONS)) {
      expect(
        ROOM_IT,
        `Missing Italian translation for room: ${room}`
      ).toHaveProperty(room);
    }
  });
});

// ── translateWeapon() ─────────────────────────────────────────────────────────

describe("translateWeapon()", () => {
  it("returns the English weapon unchanged in EN mode", () => {
    expect(translateWeapon("a frying pan")).toBe("a frying pan");
    expect(translateWeapon("a rubber duck")).toBe("a rubber duck");
  });

  it("returns the Italian weapon in IT mode", () => {
    setLang("it");
    expect(translateWeapon("a frying pan")).toBe("una padella");
    expect(translateWeapon("a rubber duck")).toBe("un'anatra di gomma");
    expect(translateWeapon("a stapler")).toBe("una cucitrice");
    expect(translateWeapon("a pool noodle")).toBe("un galleggiante");
  });

  it("falls back to the original string for unknown weapons", () => {
    setLang("it");
    expect(translateWeapon("a lightsaber")).toBe("a lightsaber");
  });

  it("covers every weapon in ROOM_WEAPONS", () => {
    setLang("it");
    const allWeapons = new Set(Object.values(ROOM_WEAPONS).flatMap((ws) => ws ?? []));
    for (const weapon of allWeapons) {
      expect(
        WEAPON_IT,
        `Missing Italian translation for weapon: "${weapon}"`
      ).toHaveProperty(weapon);
    }
  });
});

// ── ROOM_IT coverage ──────────────────────────────────────────────────────────

describe("ROOM_IT coverage", () => {
  it("has a translation for every room in ROOM_WEAPONS", () => {
    for (const room of Object.keys(ROOM_WEAPONS)) {
      expect(ROOM_IT, `Missing ROOM_IT entry for: ${room}`).toHaveProperty(room);
    }
  });

  it("has no empty translation values", () => {
    for (const [room, translation] of Object.entries(ROOM_IT)) {
      expect(translation, `Empty translation for room: ${room}`).toBeTruthy();
    }
  });
});
