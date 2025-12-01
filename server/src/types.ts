export type Role = "audience" | "producer";

export interface User {
  id: string; // socket.id
  name: string;
  role: Role;
  sessionId: string;
}

export type SuggestionCategory =
  | "tempo"
  | "mood"
  | "lyrics"
  | "instrumentation"
  | "other";

export interface Suggestion {
  id: string;
  sessionId: string;
  authorId: string;
  authorName: string;
  category: SuggestionCategory;
  text: string;
  votes: number;
  voterIds: Set<string>;
  status: "pending" | "selected" | "rejected";
  source: "human" | "ai";
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface CrowdSliderState {
  tempoPreferences: Record<string, number>; // userId -> tempo
  energyLevels: Record<string, number>; // userId -> energy
}

export interface WordCloudData {
  words: { text: string; count: number }[];
}

export interface CrowdSliderSummary {
  avgTempo: number;
  avgEnergy: number;
  voterCount: number;
}

