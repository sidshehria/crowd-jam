"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import {
  Suggestion,
  ChatMessage,
  CrowdSliderSummary,
  WordCloudData,
  SessionState,
  SuggestionCategory,
  Role,
} from "@/lib/types";
import AudienceView from "@/components/AudienceView";
import ProducerDashboard from "@/components/ProducerDashboard";
import ConnectionStatus from "@/components/ConnectionStatus";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/useToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SessionPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<Role>("audience");
  const [userId, setUserId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [wordCloud, setWordCloud] = useState<WordCloudData>({ words: [] });
  const [crowdSliderSummary, setCrowdSliderSummary] = useState<CrowdSliderSummary>({
    avgTempo: 120,
    avgEnergy: 5,
    voterCount: 0,
  });
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole") as Role;

    if (!name || !role) {
      router.push("/");
      return;
    }

    setUserName(name);
    setUserRole(role);

    // Connect to socket
    const socket = connectSocket();
    
    // Set user ID immediately if already connected, otherwise wait for connect
    if (socket.connected && socket.id) {
      setUserId(socket.id);
    } else {
      socket.on("connect", () => {
        setUserId(socket.id || "");
      });
    }

    // Join session
    socket.emit("session:join", {
      name,
      role,
      sessionId: "global-jam",
    });

    // Listen for initial state
    socket.on("session:state:init", (state: SessionState) => {
      setSuggestions(state.suggestions);
      setChatMessages(state.chat);
      setCrowdSliderSummary(state.crowdSliderSummary);
      setWordCloud(state.wordCloud);
      updateSelectedSuggestions(state.suggestions);
      setIsLoading(false);
      showToast("Successfully joined session!", "success");
    });

    socket.on("connect_error", () => {
      showToast("Connection error. Please refresh the page.", "error");
      setIsLoading(false);
    });

    // Listen for new suggestions
    socket.on("suggestion:created", (suggestion: Suggestion) => {
      setSuggestions((prev) => [...prev, suggestion]);
      if (suggestion.authorId !== socket.id) {
        showToast(`New ${suggestion.category} suggestion from ${suggestion.authorName}`, "info");
      }
    });

    // Listen for suggestion updates
    socket.on("suggestion:updated", (suggestion: Suggestion) => {
      setSuggestions((prev) => {
        const updated = prev.map((s) => (s.id === suggestion.id ? suggestion : s));
        updateSelectedSuggestions(updated);
        return updated;
      });
    });

    // Listen for chat messages
    socket.on("chat:message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Listen for word cloud updates
    socket.on("wordcloud:update", (data: WordCloudData) => {
      setWordCloud(data);
    });

    // Listen for crowd slider summary
    socket.on("crowd:slider:summary", (summary: CrowdSliderSummary) => {
      setCrowdSliderSummary(summary);
    });

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [router]);

  const updateSelectedSuggestions = (allSuggestions: Suggestion[]) => {
    setSelectedSuggestions(allSuggestions.filter((s) => s.status === "selected"));
  };

  const handleSuggestionSubmit = (category: SuggestionCategory, text: string) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit("suggestion:new", { category, text });
      showToast("Suggestion submitted!", "success");
    } else {
      showToast("Not connected. Please wait...", "error");
    }
  };

  const handleVote = (suggestionId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("suggestion:vote", { suggestionId });
    }
  };

  const handleStatusUpdate = (suggestionId: string, status: "selected" | "rejected") => {
    const socket = getSocket();
    if (socket) {
      socket.emit("suggestion:status:update", { suggestionId, status });
    }
  };

  const handleChatMessage = (text: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("chat:message", { text });
    }
  };

  const handleSliderUpdate = (tempoPreference: number, energyLevel: number) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("crowd:slider:update", { tempoPreference, energyLevel });
    }
  };

  const handleGenerateAI = async (
    category: SuggestionCategory,
    context: { topWords: string[]; avgTempo: number; avgEnergy: number }
  ): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/ai/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate AI suggestion");
      }

      const data = await response.json();
      showToast("AI suggestion generated!", "success");
      return data.text;
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      const message = error instanceof Error ? error.message : "Failed to generate AI suggestion";
      showToast(message, "error");
      throw error;
    }
  };

  const handleAddAISuggestion = (category: SuggestionCategory, text: string) => {
    handleSuggestionSubmit(category, text);
  };

  const handleCopyNotes = () => {
    const notes = selectedSuggestions
      .map((s) => `[${s.category.toUpperCase()}] ${s.text}`)
      .join("\n");
    navigator.clipboard.writeText(notes).then(() => {
      showToast("Copied to clipboard!", "success");
    });
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(selectedSuggestions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crowdjam-suggestions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported successfully!", "success");
  };

  if (!userName || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CrowdJam Live
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome, <span className="font-semibold text-purple-600">{userName}</span> (
              <span className="capitalize font-medium">{userRole}</span>)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus />
            <button
              onClick={() => {
                disconnectSocket();
                showToast("Left session", "info");
                router.push("/");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium shadow-sm"
            >
              Leave Session
            </button>
          </div>
        </div>

        {userRole === "producer" ? (
          <ProducerDashboard
            suggestions={suggestions}
            wordCloud={wordCloud}
            crowdSliderSummary={crowdSliderSummary}
            selectedSuggestions={selectedSuggestions}
            onStatusUpdate={handleStatusUpdate}
            onGenerateAI={handleGenerateAI}
            onAddAISuggestion={handleAddAISuggestion}
            onCopyNotes={handleCopyNotes}
            onExportJSON={handleExportJSON}
          />
        ) : (
          <AudienceView
            suggestions={suggestions}
            chatMessages={chatMessages}
            wordCloud={wordCloud}
            crowdSliderSummary={crowdSliderSummary}
            currentUserId={userId}
            onSuggestionSubmit={handleSuggestionSubmit}
            onVote={handleVote}
            onChatMessage={handleChatMessage}
            onSliderUpdate={handleSliderUpdate}
          />
        )}
      </div>
    </div>
  );
}

