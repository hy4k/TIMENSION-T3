
export enum AppSection {
  HOME = 'HOME',
  CHRONOSCOPE = 'CHRONOSCOPE',
  MENTORS = 'MENTORS',
  CHRONICLE = 'CHRONICLE',
  EDITOR = 'EDITOR',
}

export interface NewsArticle {
  headline: string;
  date: string;
  content: string;
  imageUrl?: string;
  weather: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  era: string;
  avatar: string;
  imageUrl: string;
  bio: string;
  systemPrompt: string;
  greeting: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AlternateHistoryResult {
    timelineSteps: string[];
    finalHeadline: string;
    imageUrl?: string;
}

export interface PivotPoint {
    id: string;
    event: string;
    year: string;
    originalOutcome: string;
    image: string;
}

// New Interface for the input-based Chronoscope
export interface ChronoscopeData {
  location: string;
  vintageMapUrl?: string;
  trivia?: string[];
  historicalPhotos?: string[];
}

export interface TravelerStats {
  rank: string;
  centuriesTraversed: number;
  paradoxesCaused: number;
  artifactsFound: number;
  majorDiscoveries: number;
  joinDate: string;
}

export interface TravelerProfile {
  email: string;
  stats: TravelerStats;
  inventory: string[];
}
