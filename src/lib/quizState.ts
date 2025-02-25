export type QuizState = {
  currentQuestion: number;
  score: number;
  isComplete: boolean;
}

export const initialQuizState: QuizState = {
  currentQuestion: 0,
  score: 0,
  isComplete: false
};

export const questions = [
  {
    question: "What is Farcaster?",
    options: [
      "A social network",
      "A blockchain",
      "A messaging app",
      "A decentralized protocol"
    ],
    correctAnswer: 3
  },
  {
    question: "What are Frames used for?",
    options: [
      "Interactive experiences",
      "Photo sharing",
      "Video calls",
      "File storage"
    ],
    correctAnswer: 0
  }
];
