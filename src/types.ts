export type MoodType = 'peaceful' | 'energized' | 'anxious' | 'reflective' | 'grateful' | 'neutral';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  body: string;
  mood: MoodType;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastSummary?: string;
}

export type ReflectionMode = 'reflection' | 'summary' | 'brainstorm' | 'chat';

export interface Interaction {
  id: string;
  entryId: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  mode: ReflectionMode;
  modelUsed?: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
