import { Flame, Star, BookCheck, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useAppStore } from "../store";

export function Dashboard({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const { xp, level, streak, wordsLearnedToday, unknownWordIds } = useAppStore();

  const xpForNextLevel = level * 100;
  const progress = ((xp % 100) / 100) * 100;

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Stats header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Moi, Learner! 👋</h1>
          <p className="text-slate-400">
            You're {xpForNextLevel - xp} XP away from reaching your next level.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-slate-500">Level {level}</div>
            <div className="text-sm font-semibold text-white">
              Finnish Explorer
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 p-0.5">
            <div className="w-full h-full bg-slate-700 rounded-full flex items-center justify-center font-bold text-white text-lg">
              L
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E232B] p-6 rounded-2xl border border-slate-700 flex items-center space-x-6"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Flame size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Day Streak
              </span>
              <span className="text-orange-400 font-bold flex items-center">
                <Flame size={16} strokeWidth={2.5} className="mr-1" />
                {streak}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-400 h-full"
                style={{ width: `${Math.min(100, streak * 10)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#1E232B] p-6 rounded-2xl border border-slate-700 flex items-center space-x-6"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Today
              </span>
              <span className="text-emerald-400 font-bold">
                {wordsLearnedToday} words
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (wordsLearnedToday / 50) * 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1E232B] p-6 rounded-2xl border border-slate-700 flex items-center space-x-6"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                To Review
              </span>
              <span className="text-red-400 font-bold">
                {unknownWordIds.length} words
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-red-400 h-full transition-all duration-500"
                style={{ width: unknownWordIds.length > 0 ? `${Math.min(100, (unknownWordIds.length / 100) * 100)}%` : '0%' }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1E232B] p-6 rounded-2xl border border-slate-700 flex items-center space-x-6 md:col-span-3"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Star size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total XP — Level {level}
              </span>
              <span className="text-blue-400 font-bold flex items-center">
                <Star size={16} strokeWidth={2.5} className="mr-1" />
                {xp}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero section */}
      <div className="bg-linear-to-br from-[#1E293B] to-[#0F172A] p-8 rounded-4xl border border-slate-700 shadow-2xl flex items-center justify-between mb-10 overflow-hidden relative">
        <div className="max-w-[70%] relative z-10">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-widest">
            Current Unit
          </span>
          <h2 className="text-4xl font-bold text-white mt-4 leading-tight">
            Master Basics &<br />
            Say Hello
          </h2>
          <p className="text-slate-300 mt-2 font-medium">
            Continue your learning path to understand simple greetings and daily
            vocabularies.
          </p>
          <button
            onClick={() => onNavigate("vocabulary")}
            className="mt-8 px-8 py-3 bg-[#003580] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl transition-all border border-blue-600/50"
          >
            Continue Lesson
          </button>
        </div>
        <div className="w-32 h-32 opacity-20 absolute right-8 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 100 100" fill="white">
            <path d="M10 30h80v40h-80z" />
            <path fill="#003580" d="M35 30h10v40h-10z" />
            <path fill="#003580" d="M10 45h80v10h-80z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("vocabulary")}
          className="bg-[#16191F] border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors text-left flex flex-col cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Vocabulary Lab</h3>
          <p className="text-slate-400 text-sm mt-1">
            Learn 10 new essential Finnish words.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("exercises")}
          className="bg-[#16191F] border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors text-left flex flex-col cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
            <svg
              className="w-6 h-6"
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
          </div>
          <h3 className="text-lg font-bold text-white">Interactive Quiz</h3>
          <p className="text-slate-400 text-sm mt-1">
            Practice with rapid-fire questions.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("pronunciation")}
          className="bg-[#16191F] border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors text-left flex flex-col cursor-pointer"
        >
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
            <svg
              className="w-6 h-6"
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
          </div>
          <h3 className="text-lg font-bold text-white">AI Pronounce</h3>
          <p className="text-slate-400 text-sm mt-1">
            Get instant feedback on your accent.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
