"use client";

import { useState } from "react";
import { SuggestionCategory } from "@/lib/types";
import MicInput from "./MicInput";

interface SuggestionInputProps {
  onSubmit: (category: SuggestionCategory, text: string) => void;
}

export default function SuggestionInput({ onSubmit }: SuggestionInputProps) {
  const [category, setCategory] = useState<SuggestionCategory>("tempo");
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    onSubmit(category, text.trim());
    setText("");
  };

  const handleTranscript = (transcript: string) => {
    setText(transcript);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Submit Suggestion</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SuggestionCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="tempo">Tempo</option>
            <option value="mood">Mood</option>
            <option value="lyrics">Lyrics</option>
            <option value="instrumentation">Instrumentation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suggestion
          </label>
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your suggestion..."
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-start pt-2">
              <MicInput onTranscript={handleTranscript} />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

