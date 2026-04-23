import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyHub } from "./vocabulary/VocabularyHub";
import { FlashCards } from "./vocabulary/FlashCards";
import { VocabQuiz } from "./vocabulary/VocabQuiz";
import { MatchWords } from "./vocabulary/MatchWords";
import { TypeYourself } from "./vocabulary/TypeYourself";
import { SpeakYourself } from "./vocabulary/SpeakYourself";

type Mode = "hub" | "flashcards" | "quiz" | "match" | "type" | "speak";

export function Vocabulary() {
  const [mode, setMode] = useState<Mode>("hub");
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2 }}
      >
        {mode === "hub" && <VocabularyHub onSelect={setMode} />}
        {mode === "flashcards" && <FlashCards onBack={() => setMode("hub")} />}
        {mode === "quiz" && <VocabQuiz onBack={() => setMode("hub")} />}
        {mode === "match" && <MatchWords onBack={() => setMode("hub")} />}
        {mode === "type" && <TypeYourself onBack={() => setMode("hub")} />}
        {mode === "speak" && <SpeakYourself onBack={() => setMode("hub")} />}
      </motion.div>
    </AnimatePresence>
  );
}
