import { DEFAULT_ROOMS, ROOM_WEAPONS } from "./data.ts";
import { buildWeaponPool, decodeConfig, encodeConfig, setup, titleCase } from "./game.ts";
import type { Plots } from "./types.ts";

// ── State ─────────────────────────────────────────────────────────────────────

let players: string[] = [];
let selectedRooms: string[] = [...DEFAULT_ROOMS];
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

// ── Setup: players ────────────────────────────────────────────────────────────

function renderPlayerList(): void {
  const list = getElement("player-list");
  if (players.length === 0) {
    list.innerHTML = `<li class="empty-hint">No players yet.</li>`;
    return;
  }
  list.innerHTML = players
    .map(
      (name, i) => `
      <li class="tag-item">
        <span>${name}</span>
        <button class="tag-remove" data-index="${i}" aria-label="Remove ${name}">×</button>
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
    el.textContent = "Add at least 3 players to start.";
    el.className = "hint hint--warn";
  } else if (n < 3) {
    el.textContent = `${n} player${n > 1 ? "s" : ""} — need ${3 - n} more.`;
    el.className = "hint hint--warn";
  } else {
    el.textContent = `${n} player${n > 1 ? "s" : ""} ready.`;
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
    setError("player-error", `${name} is already in the list.`);
    return;
  }

  players.push(name);
  input.value = "";
  renderPlayerList();
  renderPlayerCount();
}

// ── Setup: rooms ──────────────────────────────────────────────────────────────

function renderRoomChips(): void {
  const container = getElement("room-chips");
  const knownRooms = Object.keys(ROOM_WEAPONS);
  const customRooms = selectedRooms.filter((r) => !knownRooms.includes(r));
  const allRooms = [...knownRooms, ...customRooms];

  container.innerHTML = allRooms
    .map((room) => {
      const active = selectedRooms.includes(room);
      const isCustom = !knownRooms.includes(room);
      return `<button
          class="chip${active ? " chip--active" : ""}${isCustom ? " chip--custom" : ""}"
          data-room="${room}"
          data-custom="${isCustom}"
          aria-pressed="${String(active)}"
        >${room}</button>`;
    })
    .join("");

  container.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const room = chip.dataset["room"] ?? "";
      const isCustom = chip.dataset["custom"] === "true";

      if (selectedRooms.includes(room)) {
        selectedRooms = selectedRooms.filter((r) => r !== room);
      } else if (!isCustom) {
        // Re-add a known room that was toggled off
        selectedRooms = [...selectedRooms, room];
      }
      renderRoomChips();
      renderWeaponCount();
    });
  });
}

function renderWeaponCount(): void {
  const el = getElement("weapon-count");
  const count = buildWeaponPool(selectedRooms).length;
  el.textContent =
    count === 0
      ? "No weapons available — select at least one known room."
      : `${count} weapon${count > 1 ? "s" : ""} in the pool.`;
  el.className = count === 0 ? "hint hint--warn" : "hint hint--ok";
}

function addCustomRoom(): void {
  const input = getInput("room-input");
  const room = titleCase(input.value.trim());
  clearError("room-error");

  if (!room) return;

  if (selectedRooms.includes(room)) {
    setError("room-error", `${room} is already included.`);
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
    setError("setup-error", "You need at least 3 players to start.");
    return;
  }
  if (gameRooms.length === 0) {
    setError("setup-error", "You need at least one room.");
    return;
  }
  if (buildWeaponPool(gameRooms).length === 0) {
    setError("setup-error", "No weapons available — select at least one known room.");
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
    setError("play-error", "Please enter your name!");
    return;
  }

  const plot = plots[playerName];

  if (plot) {
    const assignmentDiv = getElement("assignment");
    assignmentDiv.innerHTML = `
      You are killing <b>${plot.victim}</b><br>
      with <b>${plot.weapon}</b><br>
      in <b>the ${plot.room.toLowerCase()}</b>.
      <p class="result-footer">Write this down and tell no one.</p>
    `;
    getElement("result").classList.add("show");
    nameInput.value = "";
  } else {
    setError(
      "play-error",
      "This name is not in the list! Remember to use your full first name, no nicknames."
    );
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
    setError("setup-error", "Add at least 3 players before copying the link.");
    return;
  }

  const encoded = encodeConfig({ players, rooms: selectedRooms });
  const url = `${window.location.origin}${window.location.pathname}#${encoded}`;

  void navigator.clipboard.writeText(url).then(() => {
    const btn = getElement("copy-link-btn");
    btn.textContent = "Copied!";
    window.setTimeout(() => {
      btn.textContent = "Copy game link";
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
  startGame(players, selectedRooms);
  return true;
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init(): void {
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
    plots = {};
    renderPlayerList();
    renderPlayerCount();
    renderRoomChips();
    renderWeaponCount();
    showSetupScreen();
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
      muteBtn.setAttribute("aria-label", "Mute background music");
      return;
    }

    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? "♪̸" : "♪";
    muteBtn.setAttribute(
      "aria-label",
      audio.muted ? "Unmute background music" : "Mute background music"
    );
  });
}

document.addEventListener("DOMContentLoaded", init);
