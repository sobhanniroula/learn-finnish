import { vocabulary } from "../../data/finnish";

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function buildQuizOptions(correctEnglish: string): string[] {
  const wrong = shuffle(vocabulary.filter((w) => w.english !== correctEnglish))
    .slice(0, 3)
    .map((w) => w.english);
  return shuffle([correctEnglish, ...wrong]);
}
