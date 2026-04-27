import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Mic,
  Square,
  Loader2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "../../store";
import { vocabulary } from "../../data/finnish";
import { BackBar } from "./BackBar";
import { shuffle } from "./utils";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export function SpeakYourself({ onBack }: { onBack: () => void }) {
  const [words] = useState(() => shuffle(vocabulary));
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const addXp = useAppStore((s) => s.addXp);
  const word = words[idx];

  const startRecording = async () => {
    try {
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        analyzeAudio(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setIsRecording(true);
    } catch {
      setFeedback("Microphone access is required.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const b64 = (reader.result as string).split(",")[1];
        const res = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a Finnish language tutor. The student is saying the Finnish word "${word.finnish}" (meaning: "${word.english}"). Rate their pronunciation 1–10 and give one short sentence of feedback.`,
                },
                {
                  inlineData: {
                    data: b64,
                    mimeType: (blob.type || "audio/webm") as "audio/webm",
                  },
                },
              ],
            },
          ],
        });
        setFeedback(res.text ?? null);
        addXp(20);
        setIsAnalyzing(false);
      };
    } catch {
      setFeedback("Error analyzing audio. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const next = () => {
    setFeedback(null);
    const nextIdx = idx + 1;
    if (nextIdx >= words.length) {
      setIdx(0);
      setRound((r) => r + 1);
      setShowRoundBanner(true);
      setTimeout(() => setShowRoundBanner(false), 3000);
    } else {
      setIdx(nextIdx);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <BackBar onBack={onBack} title="Speak Yourself" />

      {showRoundBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-4 flex items-center gap-3 text-indigo-300"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-sm font-medium">
            Round {round - 1} complete! Starting round {round}…
          </p>
        </motion.div>
      )}

      <div className="bg-(--bg-app) p-8 sm:p-10 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 mb-8">
          <span className="text-xs font-bold tracking-widest text-[#003580] uppercase mb-3 inline-block border border-[#003580]/50 rounded-full px-3 py-1 bg-[#003580]/10">
            Say this word
          </span>
          <h3 className="text-4xl sm:text-5xl font-bold text-white mt-4">
            {word.finnish}
          </h3>
          <p className="mt-3 text-slate-400 text-sm">{word.category}</p>
        </div>
        <div className="flex justify-center mb-6 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-500/10 text-red-500 border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 active:bg-slate-600"
            }`}
          >
            {isRecording ? (
              <Square size={28} className="fill-current" />
            ) : (
              <Mic size={32} />
            )}
          </motion.button>
        </div>
        {isRecording && (
          <p className="text-red-500 font-medium animate-pulse mb-6">
            Recording…
          </p>
        )}
        {isAnalyzing && (
          <div className="flex flex-col items-center gap-2 text-indigo-400 mb-6">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm font-medium animate-pulse">Analyzing…</p>
          </div>
        )}
        {feedback && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl text-left relative mb-6"
          >
            <Sparkles
              className="absolute top-4 right-4 text-emerald-400 opacity-50"
              size={20}
            />
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">
              Feedback
            </p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {feedback}
            </p>
          </motion.div>
        )}
        <div className="border-t border-slate-800 pt-5 flex justify-between items-center relative z-10">
          <span className="text-sm text-slate-600">
            {idx + 1} / {words.length} · Round {round}
          </span>
          <button
            onClick={next}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white active:text-white transition py-2 px-3"
          >
            Next Word <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
