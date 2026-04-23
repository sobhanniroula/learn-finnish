import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

interface RoundCompleteProps {
  round: number;
  score: number;
  total: number;
  onContinue: () => void;
  onBack: () => void;
}

export function RoundComplete({
  round,
  score,
  total,
  onContinue,
  onBack,
}: RoundCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto text-center py-12 px-4"
    >
      <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} />
      </div>
      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
        Round {round} Complete
      </span>
      <h2 className="text-2xl font-bold text-white mt-5 mb-2">Well done!</h2>
      <p className="text-slate-400 mb-8">
        Score: <span className="text-white font-semibold">{score}</span> /{" "}
        {total}
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 active:bg-blue-800 text-white shadow-xl transition-all text-base"
        >
          Continue — Round {round + 1}
        </button>
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl font-bold bg-[#16191F] text-slate-300 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 transition text-base"
        >
          Back to Vocab
        </button>
      </div>
    </motion.div>
  );
}
