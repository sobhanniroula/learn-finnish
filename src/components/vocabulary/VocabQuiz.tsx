import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAppStore } from "../../store";
import { vocabulary } from "../../data/finnish";
import { BackBar } from "./BackBar";
import { RoundComplete } from "./RoundComplete";
import { shuffle, buildQuizOptions } from "./utils";
import { SourceBadge } from "./SourceBadge";

export function VocabQuiz({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(1);
  const [words, setWords] = useState(() => shuffle(vocabulary));
  const [options, setOptions] = useState<string[][]>(() =>
    words.map((w) => buildQuizOptions(w.english, w.category)),
  );
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [delay, setDelay] = useState(1200);
  const { addXp, recordWordLearned, markUnknown, unmarkUnknown } = useAppStore();

  const word = words[idx];

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === word.english;
    const newScore = score + (isCorrect ? 1 : 0);
    if (isCorrect) {
      addXp(15);
      recordWordLearned();
      unmarkUnknown(word.id);
    } else {
      markUnknown(word.id);
    }
    const newDelay = isCorrect
      ? Math.max(300, delay / 2)
      : Math.min(3000, delay * 2.5);
    setDelay(newDelay);
    setTimeout(() => {
      if (idx === words.length - 1) {
        setScore(newScore);
        setRoundScore(newScore);
      } else {
        setScore(newScore);
        setIdx((i) => i + 1);
        setSelected(null);
      }
    }, newDelay);
  };

  const nextRound = () => {
    const newWords = shuffle(vocabulary);
    setWords(newWords);
    setOptions(newWords.map((w) => buildQuizOptions(w.english, w.category)));
    setRound((r) => r + 1);
    setIdx(0);
    setSelected(null);
    setScore(0);
    setRoundScore(null);
    setDelay(1200);
  };

  if (roundScore !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <BackBar onBack={onBack} title="Quiz" />
        <RoundComplete
          round={round}
          score={roundScore}
          total={words.length}
          onContinue={nextRound}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <BackBar onBack={onBack} title="Quiz" />
      <div className="flex justify-between text-sm text-slate-400 font-semibold mb-4">
        <span>
          {idx + 1} / {words.length} · Round {round}
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="relative bg-[#1E232B] p-6 sm:p-10 rounded-4xl border border-slate-700 shadow-2xl">
        <SourceBadge source={word.source} />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-3">
          What does this mean?
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">
          {word.finnish}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options[idx].map((opt) => {
            const isSelected = selected === opt;
            const correct = opt === word.english;
            let cls =
              "bg-[#16191F] hover:bg-slate-800 active:bg-slate-700 text-slate-200 border-slate-800";
            if (selected) {
              if (correct)
                cls =
                  "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
              else if (isSelected)
                cls = "bg-red-500/20 border-red-500/50 text-red-400";
              else
                cls =
                  "opacity-40 bg-[#16191F] border-transparent text-slate-500";
            }
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={!!selected}
                className={`relative py-5 px-4 rounded-2xl border text-base font-medium transition-all duration-300 min-h-15 ${cls}`}
              >
                {opt}
                {selected && correct && (
                  <CheckCircle2
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    size={18}
                  />
                )}
                {isSelected && !correct && (
                  <XCircle
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    size={18}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
