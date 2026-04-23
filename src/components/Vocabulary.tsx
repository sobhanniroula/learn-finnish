import { useState } from "react";
import { motion } from "motion/react";
import { useAppStore } from "../store";
import { vocabulary } from "../data/finnish";

export function Vocabulary() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const addXp = useAppStore((state) => state.addXp);

  const currentWord = vocabulary[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
      addXp(5);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Vocabulary Builder
        </h2>
        <p className="text-slate-400">
          Tap the card to flip. Learn 10 new words today!
        </p>
      </div>

      <div
        className="relative w-full max-w-md cursor-pointer"
        style={{ perspective: "1000px", aspectRatio: "4/3" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute w-full h-full flex flex-col items-center justify-center bg-[#1E232B] rounded-3xl border border-slate-700 p-8 shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              {currentWord.category}
            </span>
            <h3 className="text-5xl font-bold text-white">
              {currentWord.finnish}
            </h3>
            <p className="mt-8 text-sm text-slate-500 font-medium">
              Tap to translate
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute w-full h-full flex flex-col items-center justify-center bg-[#003580] rounded-3xl border border-blue-600 shadow-2xl p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h3 className="text-5xl font-bold text-white">
              {currentWord.english}
            </h3>
            <p className="mt-8 text-sm text-blue-200 font-medium">
              Did you get it right?
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 flex space-x-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
            setCurrentIndex((prev) =>
              prev === 0 ? vocabulary.length - 1 : prev - 1,
            );
          }}
          className="px-6 py-3 rounded-2xl font-bold bg-[#16191F] text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 text-white shadow-xl transition-all"
        >
          Next Word
        </button>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        {currentIndex + 1} / {vocabulary.length}
      </p>
    </div>
  );
}
