import { useState, useRef } from "react";
import { Mic, Square, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAppStore } from "../store";
import { pronunciationPhrases } from "../data/finnish";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export function Pronunciation() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const addXp = useAppStore((state) => state.addXp);

  const currentPhrase = pronunciationPhrases[currentIdx];
  const phrase = currentPhrase.phrase;

  const startRecording = async () => {
    try {
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        analyzeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setFeedback("Microphone access is required for pronunciation practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64String = base64data.split(",")[1];

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a friendly and encouraging Finnish language tutor.
The student is trying to say the Finnish phrase: "${phrase}".
Listen to the provided audio and rate their pronunciation from 1 to 10 (e.g. "8/10").
Provide a brief 1-2 sentence feedback on what they did well and one thing to improve. Keep it very concise.`,
                },
                {
                  inlineData: {
                    data: base64String,
                    mimeType: (audioBlob.type || "audio/webm") as "audio/webm",
                  },
                },
              ],
            },
          ],
        });

        setFeedback(response.text ?? null);
        addXp(20);
        setIsAnalyzing(false);
      };
    } catch {
      setFeedback(
        "Sorry, there was an error analyzing your pronunciation. Please try again.",
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Speak Finnish</h2>
        <p className="text-slate-400">
          Read the phrase aloud and get AI-powered feedback.
        </p>
      </div>

      <div className="bg-[#0F1115] p-10 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 mb-12">
          <span className="text-xs font-bold tracking-widest text-[#003580] uppercase mb-4 block border border-[#003580]/50 rounded-full px-3 py-1 inline-block bg-[#003580]/10">
            Target Phrase
          </span>
          <h3 className="text-4xl md:text-5xl font-bold text-white italic">
            "{phrase}"
          </h3>
          <p className="mt-4 text-slate-400">
            Meaning: {currentPhrase.translation}
          </p>
        </div>

        <div className="flex justify-center mb-8 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? "bg-red-500/10 text-red-500 border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isRecording ? (
              <Square size={32} className="fill-current" />
            ) : (
              <Mic size={36} />
            )}
          </motion.button>
        </div>

        {isRecording && (
          <p className="text-red-500 font-medium animate-pulse mb-8">
            Recording...
          </p>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center space-y-3 text-indigo-400 mb-8">
            <Loader2 className="animate-spin" size={28} />
            <p className="font-medium animate-pulse">
              Our AI is analyzing your beautiful voice...
            </p>
          </div>
        )}

        {feedback && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl text-left relative mt-8"
          >
            <Sparkles
              className="absolute top-6 right-6 text-emerald-400 opacity-50"
              size={24}
            />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-2">
              Latest Score &amp; Feedback
            </span>
            <div className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {feedback}
            </div>
          </motion.div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              setFeedback(null);
              setCurrentIdx((prev) => (prev + 1) % pronunciationPhrases.length);
            }}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-white transition"
          >
            <span>Next Phrase</span>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
