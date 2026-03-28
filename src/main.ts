import { DEFAULT_ROOMS, ROOM_WEAPONS } from "./data.ts";
import { buildWeaponPool, decodeConfig, encodeConfig, setup, titleCase } from "./game.ts";
import { d, getLang, setLang, t, translateRoom, translateWeapon } from "./i18n.ts";
import type { Plots } from "./types.ts";

// ── State ─────────────────────────────────────────────────────────────────────

let players: string[] = [];
let selectedRooms: string[] = [...DEFAULT_ROOMS];
let roomNames: Record<string, string> = {};
let plots: Plots = {};

// ── DOM helpers ───────────────────────────────────────────────────────────────

function getElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function getInput(id: string): HTMLInputElement {
  const el = getElement(id);
  if (!(el instanceof HTMLInputElement)) throw new Error(`#${id} is not an input`);
  return el;
}

function setError(id: string, message: string): void {
  getElement(id).textContent = message;
}

function clearError(id: string): void {
  getElement(id).textContent = "";
}

// ── i18n ──────────────────────────────────────────────────────────────────────

function applyStaticTranslations(): void {
  document.title = t("title");

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset["i18n"] as Parameters<typeof t>[0]);
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset["i18nHtml"] as Parameters<typeof t>[0]);
  });

  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset["i18nPlaceholder"] as Parameters<typeof t>[0]);
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute(
      "aria-label",
      t(el.dataset["i18nAriaLabel"] as Parameters<typeof t>[0])
    );
  });
}

// ── Setup: players ────────────────────────────────────────────────────────────

function renderPlayerList(): void {
  const list = getElement("player-list");
  if (players.length === 0) {
    list.innerHTML = `<li class="empty-hint">${t("noPlayersYet")}</li>`;
    return;
  }
  list.innerHTML = players
    .map(
      (name, i) => `
      <li class="tag-item">
        <span>${name}</span>
        <button class="tag-remove" data-index="${i}" aria-label="${d().removeAriaLabel(name)}">×</button>
      </li>`
    )
    .join("");

  list.querySelectorAll<HTMLButtonElement>(".tag-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset["index"]);
      players.splice(index, 1);
      renderPlayerList();
      renderPlayerCount();
    });
  });
}

function renderPlayerCount(): void {
  const el = getElement("player-count");
  const n = players.length;
  if (n === 0) {
    el.textContent = t("addAtLeast3");
    el.className = "hint hint--warn";
  } else if (n < 3) {
    el.textContent = d().playerCountWarn(n);
    el.className = "hint hint--warn";
  } else {
    el.textContent = d().playerCountOk(n);
    el.className = "hint hint--ok";
  }

  const startBtn = getElement("start-game-btn");
  if (startBtn instanceof HTMLButtonElement) {
    startBtn.disabled = n < 3;
  }
}

function addPlayer(): void {
  const input = getInput("player-input");
  const name = titleCase(input.value.trim());
  clearError("player-error");

  if (!name) return;

  if (players.includes(name)) {
    setError("player-error", d().playerAlreadyInList(name));
    return;
  }

  players.push(name);
  input.value = "";
  renderPlayerList();
  renderPlayerCount();
}

// ── Setup: rooms ──────────────────────────────────────────────────────────────

function displayRoomName(roomKey: string): string {
  return roomNames[roomKey] ?? translateRoom(roomKey);
}

function renderRoomChips(): void {
  const container = getElement("room-chips");
  const knownRooms = Object.keys(ROOM_WEAPONS);
  const customRooms = selectedRooms.filter((r) => !knownRooms.includes(r));
  const allRooms = [...knownRooms, ...customRooms];

  container.innerHTML = allRooms
    .map((room) => {
      const active = selectedRooms.includes(room);
      const isCustom = !knownRooms.includes(room);
      const rename = active
        ? `<button class="chip-rename" data-rename-room="${room}" aria-label="Rename ${room}">✎</button>`
        : "";
      return `<span class="chip-group${active ? "" : " chip-group--inactive"}">
          <button
            class="chip${active ? " chip--active" : ""}${isCustom ? " chip--custom" : ""}"
            data-room="${room}"
            data-custom="${isCustom}"
            aria-pressed="${String(active)}"
          >${displayRoomName(room)}</button>${rename}
        </span>`;
    })
    .join("");

  container.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const room = chip.dataset["room"] ?? "";
      const isCustom = chip.dataset["custom"] === "true";

      if (selectedRooms.includes(room)) {
        selectedRooms = selectedRooms.filter((r) => r !== room);
      } else if (!isCustom) {
        selectedRooms = [...selectedRooms, room];
      }
      renderRoomChips();
      renderWeaponCount();
    });
  });

  container.querySelectorAll<HTMLButtonElement>(".chip-rename").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const roomKey = btn.dataset["renameRoom"] ?? "";
      renameRoom(roomKey);
    });
  });
}

function renameRoom(roomKey: string): void {
  const currentName = roomNames[roomKey] ?? roomKey;
  const newName = window.prompt(t("renameRoomPrompt"), currentName);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed || trimmed === roomKey) {
    roomNames = Object.fromEntries(Object.entries(roomNames).filter(([k]) => k !== roomKey));
  } else {
    roomNames[roomKey] = trimmed;
  }
  renderRoomChips();
}

function renderWeaponCount(): void {
  const el = getElement("weapon-count");
  const count = buildWeaponPool(selectedRooms).length;
  el.textContent =
    count === 0 ? t("noWeaponsAvailable") : d().weaponCount(count);
  el.className = count === 0 ? "hint hint--warn" : "hint hint--ok";
}

function addCustomRoom(): void {
  const input = getInput("room-input");
  const room = titleCase(input.value.trim());
  clearError("room-error");

  if (!room) return;

  if (selectedRooms.includes(room)) {
    setError("room-error", d().roomAlreadyIncluded(room));
    return;
  }

  selectedRooms = [...selectedRooms, room];
  input.value = "";
  renderRoomChips();
  renderWeaponCount();
}

// ── Screen transitions ────────────────────────────────────────────────────────

function showSetupScreen(): void {
  getElement("setup-screen").classList.remove("hidden");
  getElement("play-screen").classList.add("hidden");
}

function showPlayScreen(): void {
  getElement("setup-screen").classList.add("hidden");
  getElement("play-screen").classList.remove("hidden");
  getElement("result").classList.remove("show");
  getInput("name").focus();
}

// ── Game start ────────────────────────────────────────────────────────────────

function startGame(gamePlayers: string[], gameRooms: string[]): void {
  clearError("setup-error");

  if (gamePlayers.length < 3) {
    setError("setup-error", t("needAtLeast3"));
    return;
  }
  if (gameRooms.length === 0) {
    setError("setup-error", t("needAtLeastOneRoom"));
    return;
  }
  if (buildWeaponPool(gameRooms).length === 0) {
    setError("setup-error", t("noWeaponsSetupError"));
    return;
  }

  plots = setup(gamePlayers, gameRooms);
  showPlayScreen();
}

// ── Play screen ───────────────────────────────────────────────────────────────

function claimVictim(): void {
  const nameInput = getInput("name");
  const playerName = titleCase(nameInput.value.trim());
  clearError("play-error");

  if (!playerName) {
    setError("play-error", t("enterYourName"));
    return;
  }

  const plot = plots[playerName];

  if (plot) {
    const weapon = translateWeapon(plot.weapon);
    const room = displayRoomName(plot.room);
    const assignmentDiv = getElement("assignment");
    assignmentDiv.innerHTML = `
      ${d().assignment(plot.victim, weapon, room)}
      <p class="result-footer">${t("resultFooter")}</p>
    `;
    getElement("result").classList.add("show");
    nameInput.value = "";
  } else {
    setError("play-error", t("nameNotInList"));
    getElement("result").classList.remove("show");
  }
}

function clearResult(): void {
  getElement("result").classList.remove("show");
}

// ── URL sharing ───────────────────────────────────────────────────────────────

function copyGameLink(): void {
  clearError("setup-error");

  if (players.length < 3) {
    setError("setup-error", t("addPlayersBeforeCopying"));
    return;
  }

  const encoded = encodeConfig({ players, rooms: selectedRooms, roomNames });
  const url = `${window.location.origin}${window.location.pathname}#${encoded}`;

  void navigator.clipboard.writeText(url).then(() => {
    const btn = getElement("copy-link-btn");
    btn.textContent = t("copied");
    window.setTimeout(() => {
      btn.textContent = t("copyLinkBtn");
    }, 2000);
  });
}

function loadFromHash(): boolean {
  const hash = window.location.hash.slice(1);
  if (!hash) return false;

  const config = decodeConfig(hash);
  if (!config) return false;

  players = [...config.players];
  selectedRooms = [...config.rooms];
  roomNames = config.roomNames ? { ...config.roomNames } : {};
  startGame(players, selectedRooms);
  return true;
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init(): void {
  applyStaticTranslations();
  renderPlayerList();
  renderPlayerCount();
  renderRoomChips();
  renderWeaponCount();

  // Player controls
  getElement("add-player-btn").addEventListener("click", addPlayer);
  getInput("player-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addPlayer();
  });

  // Room controls
  getElement("add-room-btn").addEventListener("click", addCustomRoom);
  getInput("room-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCustomRoom();
  });

  // Setup actions
  getElement("start-game-btn").addEventListener("click", () => {
    startGame(players, selectedRooms);
  });
  getElement("copy-link-btn").addEventListener("click", copyGameLink);

  // Play screen
  getElement("claim-btn").addEventListener("click", claimVictim);
  getInput("name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") claimVictim();
  });
  getElement("clear-btn").addEventListener("click", clearResult);

  getElement("new-game-btn").addEventListener("click", () => {
    window.location.hash = "";
    players = [];
    selectedRooms = [...DEFAULT_ROOMS];
    roomNames = {};
    plots = {};
    renderPlayerList();
    renderPlayerCount();
    renderRoomChips();
    renderWeaponCount();
    showSetupScreen();
  });

  // Language toggle
  getElement("lang-btn").addEventListener("click", () => {
    setLang(getLang() === "en" ? "it" : "en");
    getElement("lang-btn").textContent = getLang() === "en" ? "IT" : "EN";
    applyStaticTranslations();
    renderPlayerList();
    renderPlayerCount();
    renderRoomChips();
    renderWeaponCount();
  });

  // Load from URL hash if present, otherwise show setup
  if (!loadFromHash()) {
    showSetupScreen();
  }

  // ── Background audio ─────────────────────────────────────────────────────
  // Browsers block autoplay until a user gesture has occurred on the page.
  // We start the audio on the first interaction anywhere on the document and
  // wire up the mute toggle button.

  const audio = document.getElementById("bg-audio");
  const muteBtn = document.getElementById("mute-btn");

  if (!(audio instanceof HTMLAudioElement) || !muteBtn) return;

  let audioStarted = false;

  function startAudio(): void {
    if (audioStarted || !(audio instanceof HTMLAudioElement)) return;
    audioStarted = true;
    void audio.play();
  }

  document.addEventListener("click", startAudio, { once: true });
  document.addEventListener("keydown", startAudio, { once: true });

  muteBtn.addEventListener("click", (e) => {
    // Don't let the mute button itself count as the "first interaction" for
    // starting audio — it toggles mute state instead.
    e.stopPropagation();
    if (!(audio instanceof HTMLAudioElement)) return;

    if (!audioStarted) {
      audioStarted = true;
      void audio.play();
      muteBtn.textContent = "♪";
      muteBtn.setAttribute("aria-label", t("muteAriaLabel"));
      return;
    }

    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? "♪̸" : "♪";
    muteBtn.setAttribute("aria-label", audio.muted ? t("unmuteAriaLabel") : t("muteAriaLabel"));
  });
}

document.addEventListener("DOMContentLoaded", init);
