import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "../../store";
import { vocabulary } from "../../data/finnish";
import { BackBar } from "./BackBar";
import { shuffle } from "./utils";

// Inner component remounted each round via key prop for clean state reset
function MatchRound({
  round,
  onRoundComplete,
  onBack,
}: {
  round: number;
  onRoundComplete: () => void;
  onBack: () => void;
}) {
  const [pool] = useState(() => shuffle(vocabulary).slice(0, 6));
  const [finnishList] = useState(() => shuffle(pool));
  const [englishList] = useState(() => shuffle(pool));
  const [selectedFiIdx, setSelectedFiIdx] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const addXp = useAppStore((s) => s.addXp);

  const done = matchedIds.size === pool.length;

  const pickEnglish = (enIdx: number) => {
    if (selectedFiIdx === null) return;
    const fiWord = finnishList[selectedFiIdx];
    const enWord = englishList[enIdx];
    if (matchedIds.has(enWord.id)) return;
    if (fiWord.id === enWord.id) {
      setMatchedIds((prev) => new Set([...prev, enWord.id]));
      addXp(10);
    } else {
      setWrongPair([selectedFiIdx, enIdx]);
      setTimeout(() => setWrongPair(null), 600);
    }
    setSelectedFiIdx(null);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center py-12 px-4"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} />
        </div>
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          Round {round} Complete
        </span>
        <h2 className="text-2xl font-bold text-white mt-5 mb-2">
          All Matched!
        </h2>
        <p className="text-slate-400 mb-8">Great job! Ready for a new set?</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRoundComplete}
            className="w-full py-4 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 active:bg-blue-800 text-white transition-all"
          >
            Next Round — {round + 1}
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 rounded-2xl font-bold bg-(--bg-nav) text-slate-300 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 transition"
          >
            Back to Vocab
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <p className="text-slate-400 text-sm mb-4">
        Select a Finnish word, then tap its English match. · Round {round}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            Finnish
          </p>
          {finnishList.map((w, i) => {
            const isMatched = matchedIds.has(w.id);
            const isSelected = selectedFiIdx === i;
            const isWrong = wrongPair?.[0] === i;
            return (
              <button
                key={w.id}
                onClick={() => !isMatched && setSelectedFiIdx(i)}
                className={`p-3 sm:p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all min-h-13 ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50 cursor-default"
                    : isSelected
                      ? "bg-[#003580] border-blue-500 text-white"
                      : isWrong
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : "bg-(--bg-card) border-slate-700 text-white hover:border-slate-500 active:border-slate-400"
                }`}
              >
                {w.finnish}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            English
          </p>
          {englishList.map((w, i) => {
            const isMatched = matchedIds.has(w.id);
            const isWrong = wrongPair?.[1] === i;
            return (
              <button
                key={w.id}
                onClick={() => pickEnglish(i)}
                className={`p-3 sm:p-4 rounded-2xl border text-sm sm:text-base font-medium transition-all min-h-13 ${
                  isMatched
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50 cursor-default"
                    : isWrong
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : selectedFiIdx !== null
                        ? "bg-(--bg-card) border-slate-600 text-white hover:border-blue-500 active:border-blue-400 cursor-pointer"
                        : "bg-(--bg-card) border-slate-700 text-slate-400 cursor-default"
                }`}
              >
                {w.english}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function MatchWords({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(1);
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <BackBar onBack={onBack} title="Match Words" />
      <MatchRound
        key={round}
        round={round}
        onRoundComplete={() => setRound((r) => r + 1)}
        onBack={onBack}
      />
    </div>
  );
}
