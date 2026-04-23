import { vocabulary } from "./vocabulary-generated";
export { vocabulary };

export const exercises = [
  {
    id: 1,
    question: 'How do you say "Thank you" in Finnish?',
    options: ["Moi", "Kiitos", "Kyllä", "Yksi"],
    correctAnswer: "Kiitos",
  },
  {
    id: 2,
    question: 'Translate "Hyvää huomenta" to English.',
    options: ["Good evening", "Hello", "Good morning", "How are you?"],
    correctAnswer: "Good morning",
  },
  {
    id: 3,
    question: 'Which of the following means "Yes"?',
    options: ["Ei", "Ole hyvä", "Kyllä", "Kaksi"],
    correctAnswer: "Kyllä",
  },
];

export const pronunciationPhrases = [
  { id: 1, phrase: "Moi, mitä kuuluu?", translation: "Hello, how are you?" },
  { id: 2, phrase: "Yksi kahvi, kiitos.", translation: "One coffee, please." },
  { id: 3, phrase: "Minä rakastan Suomea.", translation: "I love Finland." },
];
