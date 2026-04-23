import { useState } from "react";
import { useAppStore } from "../../store";
import { vocabulary } from "../../data/finnish";
import { BackBar } from "./BackBar";
import { RoundComplete } from "./RoundComplete";
import { shuffle } from "./utils";

export function TypeYourself({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(1);
  const [words, setWords] = useState(() => shuffle(vocabulary));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const addXp = useAppStore((s) => s.addXp);

  const word = words[idx];

  const check = () => {
    const correct = input.trim().toLowerCase() === word.english.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => s + 1);
      addXp(12);
    }
  };

  const next = () => {
    if (idx === words.length - 1) {
      setRoundScore(score);
      return;
    }
    setIdx((i) => i + 1);
    setInput("");
    setResult(null);
  };

  const nextRound = () => {
    setWords(shuffle(vocabulary));
    setRound((r) => r + 1);
    setIdx(0);
    setInput("");
    setResult(null);
    setScore(0);
    setRoundScore(null);
  };

  if (roundScore !== null) {
    return (
      <div className="max-w-xl mx-auto px-4">
        <BackBar onBack={onBack} title="Type Yourself" />
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
    <div className="max-w-xl mx-auto py-6 px-4">
      <BackBar onBack={onBack} title="Type Yourself" />
      <div className="flex justify-between text-sm text-slate-400 font-semibold mb-4">
        <span>
          {idx + 1} / {words.length} · Round {round}
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="bg-[#1E232B] p-6 sm:p-8 rounded-4xl border border-slate-700 shadow-2xl">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-3">
          Translate to English
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
          {word.finnish}
        </h2>
        <input
          type="text"
          value={input}
          autoFocus
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              result ? next() : input.trim() && check();
            }
          }}
          placeholder="Type the English translation…"
          disabled={!!result}
          className={`w-full px-5 py-4 rounded-2xl border text-base font-medium bg-[#0F1115] outline-none transition-colors ${
            result === "correct"
              ? "border-emerald-500 text-emerald-400"
              : result === "wrong"
                ? "border-red-500 text-red-400"
                : "border-slate-700 text-white focus:border-blue-500"
          }`}
        />
        {result === "wrong" && (
          <p className="mt-3 text-sm text-slate-400">
            Correct answer:{" "}
            <span className="text-emerald-400 font-semibold">
              {word.english}
            </span>
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          {!result ? (
            <button
              onClick={check}
              disabled={!input.trim()}
              className="px-8 py-4 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white transition-all"
            >
              Check
            </button>
          ) : (
            <button
              onClick={next}
              className="px-8 py-4 rounded-2xl font-bold bg-[#003580] hover:bg-blue-700 active:bg-blue-800 text-white transition-all"
            >
              {idx === words.length - 1 ? "Finish Round" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
