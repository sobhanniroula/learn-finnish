# Learn Finnish — Project Plan

## Context & Goal

I am learning Finnish with the goal of passing the **YKI (Yleinen kielitutkinto) test** required for Finnish citizenship.

- **Current level:** A2
- **Target level:** YKI Intermediate (B1/B2)
- **Time available:** ~4 months from April 2026
- **Target exam date:** ~August 2026

The YKI intermediate test covers four skills: **reading comprehension, listening comprehension, writing, and speaking**. Passing requires a consistent performance across all four sub-tests.

---

## Why This App

A self-built web app gives me a focused, personalized learning environment tailored exactly to YKI exam requirements. Rather than relying on generic language apps, this tool will:

- Concentrate on vocabulary and grammar relevant to YKI topics
- Provide practice in all four tested skills
- Track progress over time
- Allow rapid iteration as learning needs evolve

---

## Tech Stack

| Layer            | Choice                         |
| ---------------- | ------------------------------ |
| Frontend         | React 19 + TypeScript          |
| Build tool       | Vite                           |
| Deployment       | Vercel                         |
| Styling          | TBD (likely Tailwind CSS)      |
| State management | TBD (Zustand or React Context) |
| Data persistence | TBD (localStorage / Supabase)  |

---

## Planned Learning Modules

> To be expanded as plans are finalized. Add new modules here as ideas are confirmed.

### 1. Vocabulary Flashcards

- Spaced repetition system (SRS) for YKI-relevant word lists
- Categories: daily life, work, health, civic/society topics
- Mark words as known / needs review

### 2. Grammar Drills

- Finnish case system (nominative, genitive, partitive, accusative, locatives, etc.)
- Verb conjugation (present, past, conditional, passive)
- Sentence construction exercises

### 3. Reading Comprehension

- Short Finnish texts followed by multiple-choice / open questions
- Texts graded from A2 → B2 difficulty
- Vocabulary lookup inline

### 4. Listening Comprehension

- Audio clips (dialogues, announcements, short speeches) with comprehension questions
- Playback speed control

### 5. Writing Practice

- Guided writing prompts (e.g., fill in a form, write a short message, describe a situation)
- Self-assessment checklist aligned to YKI criteria

### 6. Speaking Practice

- Prompted speaking exercises (record and self-review)
- Phonetics guide for Finnish vowel harmony and consonant gradation

### 7. Mock YKI Tests

- Timed full mock tests simulating the real YKI format
- Score tracking across attempts

### 8. Progress Dashboard

- Visual overview of study streaks, module completion, and weak areas
- Countdown to exam date

---

## YKI Exam Format Reference

| Sub-test  | Format                                                            |
| --------- | ----------------------------------------------------------------- |
| Reading   | Multiple texts, multiple-choice & short answer                    |
| Listening | Audio recordings, multiple-choice & short answer                  |
| Writing   | 2–3 written tasks (form-filling, letter/message, description)     |
| Speaking  | 4–5 tasks recorded via computer (monologue, conversation prompts) |

Passing threshold: at least **3/6** on each sub-test to pass at intermediate level.

---

## 4-Month Study Roadmap

| Month               | Focus                                                      |
| ------------------- | ---------------------------------------------------------- |
| Month 1 (April–May) | Vocabulary building, basic grammar review, app scaffolding |
| Month 2 (May–June)  | Grammar drills, reading comprehension practice             |
| Month 3 (June–July) | Listening & writing practice, first mock tests             |
| Month 4 (July–Aug)  | Full mock tests, weak area focus, speaking practice        |

---

## Project Structure (Initial)

```
learn-finnish/
├── memory-bank/
│   └── project-plan.md       ← This file
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── vercel.json
├── vite.config.ts
└── package.json
```

---

## Notes & Decisions Log

| Date       | Note                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| 2026-04-23 | Project initialized with Vite + React + TypeScript, configured for Vercel deployment |
