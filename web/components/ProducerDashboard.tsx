"use client";

import { useState } from "react";
import { Suggestion, SuggestionCategory, CrowdSliderSummary, WordCloudData } from "@/lib/types";
import SuggestionList from "./SuggestionList";
import WordCloud from "./WordCloud";
import CrowdSliders from "./CrowdSliders";

interface ProducerDashboardProps {
  suggestions: Suggestion[];
  wordCloud: WordCloudData;
  crowdSliderSummary?: CrowdSliderSummary;
  selectedSuggestions: Suggestion[];
  onStatusUpdate: (suggestionId: string, status: "selected" | "rejected") => void;
  onGenerateAI: (category: SuggestionCategory, context: any) => Promise<string>;
  onAddAISuggestion: (category: SuggestionCategory, text: string) => void;
  onCopyNotes?: () => void;
  onExportJSON?: () => void;
}

export default function ProducerDashboard({
  suggestions,
  wordCloud,
  crowdSliderSummary,
  selectedSuggestions,
  onStatusUpdate,
  onGenerateAI,
  onAddAISuggestion,
  onCopyNotes,
  onExportJSON,
}: ProducerDashboardProps) {
  const [aiCategory, setAiCategory] = useState<SuggestionCategory>("tempo");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const topWords = wordCloud.words.slice(0, 10).map((w) => w.text);
      const context = {
        topWords,
        avgTempo: crowdSliderSummary?.avgTempo || 120,
        avgEnergy: crowdSliderSummary?.avgEnergy || 5,
      };

      const text = await onGenerateAI(aiCategory, context);
      onAddAISuggestion(aiCategory, text);
    } catch (error) {
      console.error("Failed to generate AI suggestion:", error);
      // Error handling is done in parent component
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNotes = () => {
    if (onCopyNotes) {
      onCopyNotes();
      return;
    }
    const notes = selectedSuggestions
      .map((s) => `[${s.category.toUpperCase()}] ${s.text}`)
      .join("\n");
    navigator.clipboard.writeText(notes);
  };

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON();
      return;
    }
    const data = JSON.stringify(selectedSuggestions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crowdjam-suggestions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const suggestionsByCategory = {
    tempo: suggestions.filter((s) => s.category === "tempo"),
    mood: suggestions.filter((s) => s.category === "mood"),
    lyrics: suggestions.filter((s) => s.category === "lyrics"),
    instrumentation: suggestions.filter((s) => s.category === "instrumentation"),
    other: suggestions.filter((s) => s.category === "other"),
  };

  return (
    <div className="space-y-6">
      {/* Top: Crowd Sliders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <CrowdSliders summary={crowdSliderSummary} onUpdate={() => {}} readOnly />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Session Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
              <span className="text-sm font-medium text-gray-700">Total Suggestions</span>
              <span className="text-lg font-bold text-purple-600">{suggestions.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium text-gray-700">Selected</span>
              <span className="text-lg font-bold text-green-600">{selectedSuggestions.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm font-medium text-gray-700">Active Voters</span>
              <span className="text-lg font-bold text-blue-600">
                {crowdSliderSummary?.voterCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span className="text-sm font-medium text-gray-700">Pending</span>
              <span className="text-lg font-bold text-orange-600">
                {suggestions.filter((s) => s.status === "pending").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Suggestions by Category */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Top Suggestions by Category
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(suggestionsByCategory).map(([category, categorySuggestions]) => {
                if (categorySuggestions.length === 0) return null;
                const topSuggestion = [...categorySuggestions].sort(
                  (a, b) => b.votes - a.votes
                )[0];
                return (
                  <div key={category} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {topSuggestion.votes} votes
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{topSuggestion.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle: Word Cloud */}
        <div className="lg:col-span-1">
          <WordCloud data={wordCloud} size="large" />
        </div>

        {/* Right: Selected Suggestions + AI Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* AI Suggestion Generator */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">AI Suggestions</h3>
            <div className="space-y-3">
              <select
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value as SuggestionCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="tempo">Tempo</option>
                <option value="mood">Mood</option>
                <option value="lyrics">Lyrics</option>
                <option value="instrumentation">Instrumentation</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate AI Suggestion"}
              </button>
            </div>
          </div>

          {/* Selected Suggestions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Selected Suggestions</h3>
              {selectedSuggestions.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyNotes}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="Copy as Notes"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="Export as JSON"
                  >
                    Export
                  </button>
                </div>
              )}
            </div>
            {selectedSuggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">
                No selected suggestions yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-green-50 border border-green-200 rounded p-2"
                  >
                    <span className="text-xs font-medium text-green-800 capitalize">
                      {suggestion.category}
                    </span>
                    <p className="text-sm text-gray-800">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Suggestions List */}
      <div>
        <SuggestionList
          suggestions={suggestions}
          onVote={() => {}}
          onStatusUpdate={onStatusUpdate}
          isProducer={true}
        />
      </div>
    </div>
  );
}

