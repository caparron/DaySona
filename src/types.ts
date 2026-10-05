export interface Mission {
  id: string;
  title: string;
  done: boolean;
  date: string; // YYYY-MM-DD
  createdAt: number;
  importance: number;
  category?: string;
}

export interface Achievement {
  id: string;
  missionId: string;
  title: string;
  userName: string;
  date: string;
  createdAt: number;
  photo?: string;
  category?: string;
  categoryColor?: string;
}

export interface Thought {
  id: string;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface Question {
  id: string;
  content: string;
  status: 'open' | 'solved';
  date: string; // YYYY-MM-DD
  createdAt: number;
  solvedAt?: number;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface LongTermGoal {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  targetDate?: string;
  milestones: Milestone[];
  createdAt: number;
  category?: string;
}

export interface StreakData {
  current: number;
  best: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  completedDates: string[]; // YYYY-MM-DD sorted
}

export interface UserProfile {
  name: string;
  location: string;
}

export interface AppData {
  profile: UserProfile | null;
  missions: Mission[];
  thoughts: Thought[];
  questions: Question[];
  longTerm: LongTermGoal[];
  achievements: Achievement[];
  categories: string[];
  categoryColors: Record<string, string>;
  streak: StreakData;
  successThreshold: number;
}

export const emptyStreak: StreakData = {
  current: 0,
  best: 0,
  lastActiveDate: null,
  completedDates: [],
};

export const emptyData: AppData = {
  profile: null,
  missions: [],
  thoughts: [],
  questions: [],
  longTerm: [],
  achievements: [],
  categories: [],
  categoryColors: {},
  streak: emptyStreak,
  successThreshold: 70,
};
