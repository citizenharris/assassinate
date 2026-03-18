// ── Language type ──────────────────────────────────────────────────────────────

export type Language = "en" | "it";

let currentLang: Language = "en";

export function getLang(): Language {
  return currentLang;
}

export function setLang(lang: Language): void {
  currentLang = lang;
}

// ── Room translations ──────────────────────────────────────────────────────────

export const ROOM_IT: Record<string, string> = {
  Kitchen: "Cucina",
  Bathroom: "Bagno",
  Bedroom: "Camera da Letto",
  "Living Room": "Soggiorno",
  "Dining Room": "Sala da Pranzo",
  "Games Room": "Sala Giochi",
  Garden: "Giardino",
  Hallway: "Ingresso",
  Garage: "Garage",
  Patio: "Patio",
  "Hot Tub": "Vasca Idromassaggio",
  Stairs: "Scale",
  "Utility Room": "Lavanderia",
  Study: "Studio",
};

export function translateRoom(room: string): string {
  if (currentLang === "it") return ROOM_IT[room] ?? room;
  return room;
}

// ── Weapon translations ────────────────────────────────────────────────────────

export const WEAPON_IT: Record<string, string> = {
  "a frying pan": "una padella",
  "a wooden spoon": "un cucchiaio di legno",
  "a rolling pin": "un mattarello",
  "a wine bottle": "una bottiglia di vino",
  "a tea towel": "un canovaccio",
  "a mug": "una tazza",
  "a teapot or cafetière": "una teiera o moka",
  "an eggcup": "un portauovo",
  "a pot or pan": "una pentola o padella",
  "some butter": "del burro",
  "a piece of fruit": "un pezzo di frutta",
  "a jug of water": "una caraffa d'acqua",
  "a colander": "uno scolapasta",
  "a spatula": "una spatola",
  "a bar of soap": "una saponetta",
  "a loo roll": "un rotolo di carta igienica",
  "a toothbrush": "uno spazzolino",
  "a rubber duck": "un'anatra di gomma",
  "a flannel": "un guanto di spugna",
  "a shower cap": "una cuffia da doccia",
  "a loofa": "una spugna vegetale",
  "a pillow": "un cuscino",
  "a book": "un libro",
  "a pair of spectacles": "un paio di occhiali",
  "a multicoloured sock": "un calzino multicolore",
  "a phone charger": "un caricatore",
  "a coat hanger": "una gruccia",
  "a bedside lamp": "una lampada da comodino",
  "a cushion": "un cuscino",
  "a TV remote": "un telecomando",
  "a bracelet": "un braccialetto",
  "a coaster": "un sottobicchiere",
  "a credit or debit card": "una carta di credito o debito",
  "a napkin": "un tovagliolo",
  "a candle": "una candela",
  "a place mat": "una tovaglietta",
  "a salt shaker": "una saliera",
  "a pepper grinder": "un macinapepe",
  "a playing card": "una carta da gioco",
  "a die": "un dado",
  "a chess piece": "un pezzo degli scacchi",
  "a ping pong ball": "una pallina da ping pong",
  "a pool cue": "una stecca da biliardo",
  "a board game box": "una scatola di gioco da tavolo",
  "a garden glove": "un guanto da giardinaggio",
  "a trowel": "una paletta",
  "a watering can": "un annaffiatoio",
  "a plant pot": "un vaso di piante",
  "a garden fork": "un forcone da giardino",
  "a kneeling pad": "un tappetino da ginocchio",
  "an umbrella": "un ombrello",
  "a door key": "una chiave di casa",
  "a scarf": "una sciarpa",
  "a welcome mat": "uno zerbino",
  "a screwdriver": "un cacciavite",
  "a torch": "una torcia",
  "a broom": "una scopa",
  "a paint roller": "un rullo da pittura",
  "a spirit level": "una livella",
  "a garden chair": "una sedia da giardino",
  "a citronella candle": "una candela alla citronella",
  "a pair of BBQ tongs": "un paio di pinze per il barbecue",
  "an outdoor cushion": "un cuscino da esterno",
  "a pool noodle": "un galleggiante",
  "a towel": "un asciugamano",
  "a floating drinks holder": "un portabevande galleggiante",
  "a lightbulb": "una lampadina",
  "a notebook": "un taccuino",
  "a paper chicken": "un pollo di carta",
  "a shoe": "una scarpa",
  "a sock": "un calzino",
  "a mop": "un mocio",
  "a sponge": "una spugna",
  "a laundry basket": "un cestino del bucato",
  "a clothes peg": "una molletta",
  "a dustpan": "una paletta per la polvere",
  "a stapler": "una cucitrice",
  "a pen": "una penna",
  "a rubber band": "un elastico",
  "a ruler": "un righello",
  "a paperclip": "una graffetta",
};

export function translateWeapon(weapon: string): string {
  if (currentLang === "it") return WEAPON_IT[weapon] ?? weapon;
  return weapon;
}

// ── Static translations ────────────────────────────────────────────────────────

const STATIC = {
  en: {
    title: "Assassin",
    h1: "🔪 Assassin 🔪",
    playersHeading: "Players",
    playerInputPlaceholder: "First name...",
    addPlayerBtn: "Add",
    roomsHeading: "Rooms",
    roomsDescription:
      "Toggle the rooms in your house. Active rooms build the weapon pool — weapons and locations are then assigned independently.",
    roomInputPlaceholder: "Add a custom room...",
    addRoomBtn: "Add",
    startGameBtn: "Start Game",
    copyLinkBtn: "Copy game link",
    rulesTitle: "The rules",
    rule1: "Kill your victim with the specified weapon, <em>only in the specified location</em>.",
    rule2: "You must hand them the weapon — throwing it doesn't count.",
    rule3: "The weapon must be handed over undisguised.",
    rule4: "A successful assassination means you inherit your victim's target.",
    rule5: "Last one standing wins.",
    encouragement: "Be creative. The game is afoot!",
    playLabel: "Your first name, killer",
    nameInputPlaceholder: "Enter your name...",
    claimBtn: "Claim your victim",
    clearBtn: "Clear screen",
    newGameBtn: "← New game",
    muteAriaLabel: "Mute background music",
    unmuteAriaLabel: "Unmute background music",
    noPlayersYet: "No players yet.",
    addAtLeast3: "Add at least 3 players to start.",
    noWeaponsAvailable: "No weapons available — select at least one known room.",
    needAtLeast3: "You need at least 3 players to start.",
    needAtLeastOneRoom: "You need at least one room.",
    noWeaponsSetupError: "No weapons available — select at least one known room.",
    enterYourName: "Please enter your name!",
    nameNotInList:
      "This name is not in the list! Remember to use your full first name, no nicknames.",
    addPlayersBeforeCopying: "Add at least 3 players before copying the link.",
    copied: "Copied!",
    resultFooter: "Write this down and tell no one.",
  },
  it: {
    title: "Assassino",
    h1: "🔪 Assassino 🔪",
    playersHeading: "Giocatori",
    playerInputPlaceholder: "Nome...",
    addPlayerBtn: "Aggiungi",
    roomsHeading: "Stanze",
    roomsDescription:
      "Seleziona le stanze della tua casa. Le stanze attive costruiscono il pool di armi — armi e posizioni vengono assegnate indipendentemente.",
    roomInputPlaceholder: "Aggiungi una stanza...",
    addRoomBtn: "Aggiungi",
    startGameBtn: "Inizia la partita",
    copyLinkBtn: "Copia link partita",
    rulesTitle: "Le regole",
    rule1:
      "Uccidi la tua vittima con l'arma specificata, <em>solo nella posizione specificata</em>.",
    rule2: "Devi consegnargli l'arma — lanciarla non conta.",
    rule3: "L'arma deve essere consegnata senza travestimenti.",
    rule4: "Un'assassinio riuscito significa che erediti il bersaglio della tua vittima.",
    rule5: "L'ultimo rimasto vince.",
    encouragement: "Sii creativo. Il gioco è cominciato!",
    playLabel: "Il tuo nome, assassino",
    nameInputPlaceholder: "Inserisci il tuo nome...",
    claimBtn: "Rivendica la tua vittima",
    clearBtn: "Pulisci schermo",
    newGameBtn: "← Nuova partita",
    muteAriaLabel: "Disattiva musica di sottofondo",
    unmuteAriaLabel: "Attiva musica di sottofondo",
    noPlayersYet: "Nessun giocatore ancora.",
    addAtLeast3: "Aggiungi almeno 3 giocatori per iniziare.",
    noWeaponsAvailable: "Nessuna arma disponibile — seleziona almeno una stanza nota.",
    needAtLeast3: "Servono almeno 3 giocatori per iniziare.",
    needAtLeastOneRoom: "Serve almeno una stanza.",
    noWeaponsSetupError: "Nessuna arma disponibile — seleziona almeno una stanza nota.",
    enterYourName: "Inserisci il tuo nome!",
    nameNotInList:
      "Questo nome non è nella lista! Ricorda di usare il tuo nome completo, senza soprannomi.",
    addPlayersBeforeCopying: "Aggiungi almeno 3 giocatori prima di copiare il link.",
    copied: "Copiato!",
    resultFooter: "Scrivilo e non dirlo a nessuno.",
  },
} as const;

type StaticKey = keyof (typeof STATIC)["en"];

export function t(key: StaticKey): string {
  return STATIC[currentLang][key];
}

// ── Dynamic translations ───────────────────────────────────────────────────────

const DYNAMIC = {
  en: {
    playerCountWarn: (n: number): string => `${n} player${n > 1 ? "s" : ""} — need ${3 - n} more.`,
    playerCountOk: (n: number): string => `${n} player${n > 1 ? "s" : ""} ready.`,
    removeAriaLabel: (name: string): string => `Remove ${name}`,
    playerAlreadyInList: (name: string): string => `${name} is already in the list.`,
    weaponCount: (n: number): string => `${n} weapon${n > 1 ? "s" : ""} in the pool.`,
    roomAlreadyIncluded: (room: string): string => `${room} is already included.`,
    assignment: (victim: string, weapon: string, room: string): string =>
      `You are killing <b>${victim}</b><br>with <b>${weapon}</b><br>in <b>the ${room.toLowerCase()}</b>.`,
  },
  it: {
    playerCountWarn: (n: number): string =>
      `${n} giocator${n === 1 ? "e" : "i"} — ne servono ancora ${3 - n}.`,
    playerCountOk: (n: number): string =>
      `${n} giocator${n === 1 ? "e" : "i"} ${n === 1 ? "pronto" : "pronti"}.`,
    removeAriaLabel: (name: string): string => `Rimuovi ${name}`,
    playerAlreadyInList: (name: string): string => `${name} è già nella lista.`,
    weaponCount: (n: number): string => `${n} ${n === 1 ? "arma disponibile" : "armi disponibili"}.`,
    roomAlreadyIncluded: (room: string): string => `${room} è già inclusa.`,
    assignment: (victim: string, weapon: string, room: string): string =>
      `Stai uccidendo <b>${victim}</b><br>con <b>${weapon}</b><br>in <b>${room}</b>.`,
  },
};

type DynamicBundle = (typeof DYNAMIC)["en"];

export function d(): DynamicBundle {
  return DYNAMIC[currentLang];
}
