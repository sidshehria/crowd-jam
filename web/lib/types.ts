export type Role = "audience" | "producer";

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
  voterIds: string[];
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

export interface CrowdSliderSummary {
  avgTempo: number;
  avgEnergy: number;
  voterCount: number;
}

export interface WordCloudData {
  words: { text: string; count: number }[];
}

export interface SessionState {
  suggestions: Suggestion[];
  chat: ChatMessage[];
  crowdSliderSummary: CrowdSliderSummary;
  wordCloud: WordCloudData;
}

