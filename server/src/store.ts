import { User, Suggestion, ChatMessage, CrowdSliderState } from "./types";

// In-memory data stores
export const users = new Map<string, User>();
export const suggestions = new Map<string, Suggestion>();
export const chatMessages: ChatMessage[] = [];
export const crowdSliderState: CrowdSliderState = {
  tempoPreferences: {},
  energyLevels: {},
};

// Word cloud data (rolling window of last 200 messages + suggestions)
const WORD_CLOUD_WINDOW = 200;
const stopwords = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "can", "this", "that",
  "these", "those", "i", "you", "he", "she", "it", "we", "they", "me",
  "him", "her", "us", "them", "my", "your", "his", "her", "its", "our",
  "their", "what", "which", "who", "whom", "whose", "where", "when",
  "why", "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "just", "now"
]);

function processText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));
}

export function updateWordCloud(): { text: string; count: number }[] {
  const wordCounts = new Map<string, number>();
  
  // Process last N chat messages
  const recentMessages = chatMessages.slice(-WORD_CLOUD_WINDOW);
  for (const msg of recentMessages) {
    const words = processText(msg.text);
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  
  // Process all suggestions
  for (const suggestion of suggestions.values()) {
    const words = processText(suggestion.text);
    for (const word of words) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  
  // Convert to array and sort by count
  return Array.from(wordCounts.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50 words
}

