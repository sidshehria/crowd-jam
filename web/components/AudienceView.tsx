"use client";

import { Suggestion, ChatMessage, CrowdSliderSummary, WordCloudData, SuggestionCategory } from "@/lib/types";
import SuggestionInput from "./SuggestionInput";
import SuggestionList from "./SuggestionList";
import ChatPanel from "./ChatPanel";
import CrowdSliders from "./CrowdSliders";
import WordCloud from "./WordCloud";

interface AudienceViewProps {
  suggestions: Suggestion[];
  chatMessages: ChatMessage[];
  wordCloud: WordCloudData;
  crowdSliderSummary?: CrowdSliderSummary;
  currentUserId?: string;
  onSuggestionSubmit: (category: SuggestionCategory, text: string) => void;
  onVote: (suggestionId: string) => void;
  onChatMessage: (text: string) => void;
  onSliderUpdate: (tempoPreference: number, energyLevel: number) => void;
}

export default function AudienceView({
  suggestions,
  chatMessages,
  wordCloud,
  crowdSliderSummary,
  currentUserId,
  onSuggestionSubmit,
  onVote,
  onChatMessage,
  onSliderUpdate,
}: AudienceViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Suggestion Input + List */}
      <div className="lg:col-span-1 space-y-4">
        <SuggestionInput onSubmit={onSuggestionSubmit} />
        <SuggestionList
          suggestions={suggestions}
          currentUserId={currentUserId}
          onVote={onVote}
        />
      </div>

      {/* Middle: Suggestions Feed */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Feed</h3>
          <SuggestionList
            suggestions={suggestions}
            currentUserId={currentUserId}
            onVote={onVote}
          />
        </div>
      </div>

      {/* Right: Chat + Sliders + Word Cloud */}
      <div className="lg:col-span-1 space-y-4">
        <ChatPanel
          messages={chatMessages}
          currentUserId={currentUserId}
          onSendMessage={onChatMessage}
        />
        <CrowdSliders
          summary={crowdSliderSummary}
          onUpdate={onSliderUpdate}
          readOnly={false}
        />
        <WordCloud data={wordCloud} size="small" />
      </div>
    </div>
  );
}

