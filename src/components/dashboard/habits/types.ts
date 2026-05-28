export const ROUND_SIZE = 22;

export type ActiveHabit = {
  name: string;
  round: number;
  /** length 0..22 — true = done, false = missed. Indexes past length = future/empty. */
  cells: boolean[];
};

export type PlaceholderHabit = {
  name: string;
};
