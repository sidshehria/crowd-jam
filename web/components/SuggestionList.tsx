"use client";

import { Suggestion } from "@/lib/types";

interface SuggestionListProps {
  suggestions: Suggestion[];
  currentUserId?: string;
  onVote: (suggestionId: string) => void;
  onStatusUpdate?: (suggestionId: string, status: "selected" | "rejected") => void;
  isProducer?: boolean;
}

export default function SuggestionList({
  suggestions,
  currentUserId,
  onVote,
  onStatusUpdate,
  isProducer = false,
}: SuggestionListProps) {
  const sortedSuggestions = [...suggestions].sort((a, b) => b.votes - a.votes);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tempo: "bg-blue-100 text-blue-800",
      mood: "bg-green-100 text-green-800",
      lyrics: "bg-yellow-100 text-yellow-800",
      instrumentation: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    if (status === "selected") {
      return <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Selected</span>;
    }
    if (status === "rejected") {
      return <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Rejected</span>;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Suggestions</h3>
      {sortedSuggestions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No suggestions yet</p>
          <p className="text-sm text-gray-400">Be the first to submit an idea!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sortedSuggestions.map((suggestion, index) => {
            const hasVoted = currentUserId && suggestion.voterIds.includes(currentUserId);
            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(
                          suggestion.category
                        )}`}
                      >
                        {suggestion.category}
                      </span>
                      {suggestion.source === "ai" && (
                        <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded">
                          AI
                        </span>
                      )}
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-gray-800 mb-2">{suggestion.text}</p>
                    <p className="text-xs text-gray-500">
                      by {suggestion.authorName}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 ml-4">
                    <button
                      onClick={() => onVote(suggestion.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        hasVoted
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ↑ {suggestion.votes}
                    </button>
                    {isProducer && onStatusUpdate && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onStatusUpdate(suggestion.id, "selected")}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Select"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => onStatusUpdate(suggestion.id, "rejected")}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Reject"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

