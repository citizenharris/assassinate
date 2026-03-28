export interface Plot {
  readonly victim: string;
  readonly weapon: string;
  readonly room: string;
}

export type Plots = Readonly<Record<string, Plot | undefined>>;

export interface GameConfig {
  readonly players: readonly string[];
  readonly rooms: readonly string[];
  readonly roomNames?: Readonly<Record<string, string>>;
}
