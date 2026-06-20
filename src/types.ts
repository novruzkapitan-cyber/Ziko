export interface Question {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  isAiGenerated?: boolean;
}

export type SubjectId = 'math' | 'lang' | 'science' | 'history';

export interface Subject {
  id: SubjectId;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  topics: string[];
}

export interface QuizSession {
  subjectId: SubjectId;
  topic: string;
  questions: Question[];
  currentIndex: number;
  selectedAnswers: { [questionId: string]: number };
  answersLocked: { [questionId: string]: boolean };
  completed: boolean;
  score: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  questionContext?: {
    questionText: string;
    submittedAnswer?: string;
    correctAnswer?: string;
  };
}

export interface UserStats {
  points: number;
  xp: number;
  level: number;
  badges: Badge[];
  completedQuizzesCount: number;
  subjectProgress: {
    [key in SubjectId]?: {
      solved: number;
      correct: number;
    };
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  color: string;
}
