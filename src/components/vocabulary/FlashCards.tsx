import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "../../store";
import { vocabulary } from "../../data/finnish";
import { BackBar } from "./BackBar";
import { SourceBadge } from "./SourceBadge";

export function FlashCards({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [round, setRound] = useState(1);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const addXp = useAppStore((s) => s.addXp);
  const word = vocabulary[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    addXp(5);
    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      if (nextIdx >= vocabulary.length) {
        setCurrentIndex(0);
        setRound((r) => r + 1);
        setShowRoundBanner(true);
        setTimeout(() => setShowRoundBanner(false), 3000);
      } else {
        setCurrentIndex(nextIdx);
      }
    }, 150);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((p) => (p === 0 ? vocabulary.length - 1 : p - 1)),
      150,
    );
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto py-6 px-4">
      <div className="w-full">
        <BackBar onBack={onBack} title="Flash Cards" />
      </div>

      {showRoundBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-4 flex items-center gap-3 text-blue-300"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-sm font-medium">
            Round {round - 1} complete! Starting round {round}…
          </p>
        </motion.div>
      )}

      <p className="text-slate-400 mb-6 text-sm text-center">
        Tap the card to flip and reveal the translation.
      </p>

      <div
        className="relative w-full max-w-md cursor-pointer select-none"
        style={{ perspective: "1000px", aspectRatio: "4/3" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.55,
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute w-full h-full flex flex-col items-center justify-center bg-[#1E232B] rounded-3xl border border-slate-700 p-6 shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <SourceBadge source={word.source} />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              {word.category}
            </span>
            <h3 className="text-4xl sm:text-5xl font-bold text-white">
              {word.finnish}
            </h3>
            <p className="mt-6 text-sm text-slate-500">Tap to translate</p>
          </div>
          <div
            className="absolute w-full h-full flex flex-col items-center justify-center bg-[#003580] rounded-3xl border border-blue-600 shadow-2xl p-6"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h3 className="text-4xl sm:text-5xl font-bold text-white">
              {word.english}
            </h3>
            <p className="mt-6 text-sm text-blue-200">Did you get it right?</p>
          </div>
        </motion.div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {currentIndex + 1} / {vocabulary.length} · Round {round}
      </p>

      <div className="mt-6 flex gap-3 w-full max-w-md">
        <button
          onClick={goPrev}
          className="flex-1 py-4 rounded-2xl font-bold bg-[#16191F] text-slate-300 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 transition"
        >
          Previous
        </button>
        <button
          onClick={goNext}
          className="flex-1 py-4 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 active:bg-blue-800 text-white shadow-xl transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
