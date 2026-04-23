import { motion } from "motion/react";

type Mode = "hub" | "flashcards" | "quiz" | "match" | "type" | "speak";

const features: {
  id: Mode;
  label: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "flashcards",
    label: "Flash Cards",
    desc: "Tap to flip and reveal the translation.",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M3 14h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
        />
      </svg>
    ),
  },
  {
    id: "quiz",
    label: "Quiz",
    desc: "Multiple-choice — pick the right translation.",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    id: "match",
    label: "Match Words",
    desc: "Pair each Finnish word with its English meaning.",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    ),
  },
  {
    id: "type",
    label: "Type Yourself",
    desc: "See the Finnish word — type the English translation.",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    id: "speak",
    label: "Speak Yourself",
    desc: "Read the word aloud — AI scores your pronunciation.",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    ),
  },
];

export function VocabularyHub({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:py-10">
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Vocabulary Lab
        </h2>
        <p className="text-slate-400">
          Choose a learning mode to practise your Finnish words.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {features.map((f, i) => (
          <motion.button
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(f.id)}
            className="bg-[#16191F] border border-slate-800 hover:border-slate-700 active:border-slate-600 p-5 md:p-6 rounded-3xl text-left flex flex-col gap-4 transition-colors cursor-pointer"
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center ${f.color}`}
            >
              {f.icon}
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                {f.label}
              </h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
