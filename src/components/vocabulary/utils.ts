import { vocabulary } from "../../data/finnish";

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function buildQuizOptions(
  correctEnglish: string,
  category?: string,
): string[] {
  // Prefer distractors from the same category (harder), fall back to any
  const sameCat = category
    ? vocabulary.filter(
        (w) => w.english !== correctEnglish && w.category === category,
      )
    : [];
  const otherCat = vocabulary.filter(
    (w) => w.english !== correctEnglish && w.category !== category,
  );
  const pool = shuffle([...sameCat, ...otherCat]);
  const wrong = pool.slice(0, 3).map((w) => w.english);
  return shuffle([correctEnglish, ...wrong]);
}
