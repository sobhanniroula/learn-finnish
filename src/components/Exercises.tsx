import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store";
import { exercises } from "../data/finnish";

export function Exercises() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const addXp = useAppStore((state) => state.addXp);

  const exercise = exercises[currentExercise];

  const handleSelect = (option: string) => {
    if (selectedOption !== null) return;

    setSelectedOption(option);
    const correct = option === exercise.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      addXp(15);
    }

    setTimeout(() => {
      if (currentExercise === exercises.length - 1) {
        setIsFinished(true);
      } else {
        setCurrentExercise((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      }
    }, 1500);
  };

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-20"
      >
        <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Lesson Complete!</h2>
        <p className="text-slate-400 mb-8">
          You scored {score} out of {exercises.length}.
        </p>
        <button
          onClick={() => {
            setIsFinished(false);
            setCurrentExercise(0);
            setScore(0);
            setSelectedOption(null);
            setIsCorrect(null);
          }}
          className="px-8 py-3 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 text-white shadow-xl transition-all border border-blue-600/50"
        >
          Practice Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8 flex justify-between items-center text-sm font-semibold text-slate-400">
        <span>
          Exercise {currentExercise + 1} of {exercises.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="bg-[#1E232B] p-8 md:p-12 rounded-4xl border border-slate-700 mb-8 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          {exercise.question}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {exercise.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === exercise.correctAnswer;

              let buttonStyle =
                "bg-[#16191F] hover:bg-slate-800 text-slate-200 border-slate-800";

              if (selectedOption) {
                if (isSelected && isCorrect)
                  buttonStyle =
                    "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                else if (isSelected && !isCorrect)
                  buttonStyle = "bg-red-500/20 border-red-500/50 text-red-400";
                else if (isCorrectOption)
                  buttonStyle =
                    "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
                else
                  buttonStyle =
                    "bg-[#16191F] text-slate-600 border-transparent opacity-50";
              }

              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleSelect(option)}
                  disabled={selectedOption !== null}
                  className={`relative p-6 rounded-2xl border text-lg font-medium transition-all duration-300 ${buttonStyle}`}
                >
                  {option}
                  {isSelected && isCorrect && (
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                  {isSelected && !isCorrect && (
                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
