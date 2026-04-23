export const vocabulary = [
  { id: 1, finnish: "Moi", english: "Hello", category: "Greetings" },
  { id: 2, finnish: "Kiitos", english: "Thank you", category: "Basics" },
  {
    id: 3,
    finnish: "Ole hyvä",
    english: "You are welcome",
    category: "Basics",
  },
  {
    id: 4,
    finnish: "Hyvää huomenta",
    english: "Good morning",
    category: "Greetings",
  },
  { id: 5, finnish: "Näkemiin", english: "Goodbye", category: "Greetings" },
  { id: 6, finnish: "Yksi", english: "One", category: "Numbers" },
  { id: 7, finnish: "Kaksi", english: "Two", category: "Numbers" },
  { id: 8, finnish: "Kyllä", english: "Yes", category: "Basics" },
  { id: 9, finnish: "Ei", english: "No", category: "Basics" },
  {
    id: 10,
    finnish: "Mitä kuuluu?",
    english: "How are you?",
    category: "Greetings",
  },
];

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
