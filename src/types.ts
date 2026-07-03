export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: string;
  occupation?: string;
  habitGoals?: string;
  reminderPreferences?: {
    email: boolean;
    browser: boolean;
    push: boolean;
  };
  xp: number;
  level: number;
  coins: number;
  badges: string[];
  premium: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  severity: "Mild" | "Moderate" | "Severe";
  recoveryDifficulty: "Easy" | "Medium" | "Hard" | "Very Hard";
  confidenceScore: number;
  rootCauses?: string[];
  triggerSituations?: string[];
  emotionalPatterns?: string[];
  longTermRisks?: string[];
  streak: number;
  maxStreak: number;
  status: "active" | "broken" | "paused";
  createdAt: string;
}

export interface RecoveryPlanDay {
  day: number;
  morningGoal: string;
  eveningGoal: string;
  alternateActivity: string;
  tips: string;
  reward: string;
  description: string;
  completed?: boolean;
}

export interface RecoveryPlan {
  id: string;
  userId: string;
  habitId: string;
  days: RecoveryPlanDay[];
  morningRoutine: string;
  eveningRoutine: string;
  healthyAlternatives: string[];
  createdAt: string;
}

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  xp: number;
  coins: number;
  status: "pending" | "completed" | "skipped";
  date: string;
  habitId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: "Happy" | "Calm" | "Neutral" | "Sad" | "Stressed";
  moodEmoji: string;
  wins?: string;
  challenges?: string;
  lessons?: string;
  aiSummary?: string;
  aiPatterns?: string[];
  date: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
