import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  User,
  Suggestion,
  ChatMessage,
  Role,
  SuggestionCategory,
  CrowdSliderSummary,
} from "./types";
import { users, suggestions, chatMessages, crowdSliderState, updateWordCloud } from "./store";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: users.size,
    suggestions: suggestions.size,
  });
});

// AI suggestion endpoint
app.post("/ai/suggest", async (req, res) => {
  const { category, context } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  const { topWords = [], avgTempo = 120, avgEnergy = 5 } = context || {};

  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `You are helping a music producer in a live crowd-sourced music session. Crowd mood words: ${topWords.slice(0, 10).join(", ")}. Average tempo: ${avgTempo} BPM. Average energy: ${avgEnergy}/10. Suggest a short ${category} idea that fits this vibe. Keep it under 20 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
      });

      const text = completion.choices[0]?.message?.content || "No suggestion generated";
      return res.json({ text });
    } catch (error) {
      console.error("OpenAI error:", error);
      // Fall through to mock
    }
  }

  // Mock suggestions
  const mockSuggestions: Record<string, string[]> = {
    tempo: ["Try 128 BPM for a danceable groove", "Slow it down to 90 BPM for a chill vibe"],
    mood: ["Energetic and uplifting", "Dark and mysterious atmosphere"],
    lyrics: ["Rise up and feel the beat", "Lost in the rhythm of the night"],
    instrumentation: ["Add a synth pad for depth", "Layer in some percussion"],
    other: ["Build tension with a riser", "Add a breakdown section"],
  };

  const options = mockSuggestions[category] || mockSuggestions.other;
  const text = options[Math.floor(Math.random() * options.length)];

  res.json({ text });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("session:join", (data: { name: string; role: Role; sessionId: string }) => {
    const { name, role, sessionId } = data;

    // Create user
    const user: User = {
      id: socket.id,
      name,
      role,
      sessionId,
    };
    users.set(socket.id, user);

    // Join room
    socket.join(sessionId);

    // Calculate crowd slider summary
    const tempoValues = Object.values(crowdSliderState.tempoPreferences);
    const energyValues = Object.values(crowdSliderState.energyLevels);
    const avgTempo = tempoValues.length > 0
      ? tempoValues.reduce((a, b) => a + b, 0) / tempoValues.length
      : 120;
    const avgEnergy = energyValues.length > 0
      ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
      : 5;

    const summary: CrowdSliderSummary = {
      avgTempo: Math.round(avgTempo),
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      voterCount: Math.max(tempoValues.length, energyValues.length),
    };

    // Send initial state
    socket.emit("session:state:init", {
      suggestions: Array.from(suggestions.values())
        .filter((s) => s.sessionId === sessionId)
        .map((s) => ({
          ...s,
          voterIds: Array.from(s.voterIds),
        })),
      chat: chatMessages
        .filter((m) => m.sessionId === sessionId)
        .slice(-50),
      crowdSliderSummary: summary,
      wordCloud: updateWordCloud(),
    });
  });

  socket.on("suggestion:new", (data: { category: SuggestionCategory; text: string }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const suggestion: Suggestion = {
      id: uuidv4(),
      sessionId: user.sessionId,
      authorId: user.id,
      authorName: user.name,
      category: data.category,
      text: data.text,
      votes: 0,
      voterIds: new Set(),
      status: "pending",
      source: "human",
      createdAt: Date.now(),
    };

    suggestions.set(suggestion.id, suggestion);

    io.to(user.sessionId).emit("suggestion:created", {
      ...suggestion,
      voterIds: Array.from(suggestion.voterIds),
    });

    // Update word cloud
    io.to(user.sessionId).emit("wordcloud:update", {
      words: updateWordCloud(),
    });
  });

  socket.on("suggestion:vote", (data: { suggestionId: string }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const suggestion = suggestions.get(data.suggestionId);
    if (!suggestion || suggestion.sessionId !== user.sessionId) return;

    if (suggestion.voterIds.has(user.id)) {
      // Unvote
      suggestion.voterIds.delete(user.id);
      suggestion.votes--;
    } else {
      // Vote
      suggestion.voterIds.add(user.id);
      suggestion.votes++;
    }

    suggestions.set(suggestion.id, suggestion);

    io.to(user.sessionId).emit("suggestion:updated", {
      ...suggestion,
      voterIds: Array.from(suggestion.voterIds),
    });
  });

  socket.on("suggestion:status:update", (data: { suggestionId: string; status: "selected" | "rejected" }) => {
    const user = users.get(socket.id);
    if (!user || user.role !== "producer") return;

    const suggestion = suggestions.get(data.suggestionId);
    if (!suggestion || suggestion.sessionId !== user.sessionId) return;

    suggestion.status = data.status;
    suggestions.set(suggestion.id, suggestion);

    io.to(user.sessionId).emit("suggestion:updated", {
      ...suggestion,
      voterIds: Array.from(suggestion.voterIds),
    });
  });

  socket.on("chat:message", (data: { text: string }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message: ChatMessage = {
      id: uuidv4(),
      sessionId: user.sessionId,
      authorId: user.id,
      authorName: user.name,
      text: data.text,
      createdAt: Date.now(),
    };

    chatMessages.push(message);
    // Keep only last 200 messages
    if (chatMessages.length > 200) {
      chatMessages.shift();
    }

    io.to(user.sessionId).emit("chat:message", message);

    // Update word cloud
    io.to(user.sessionId).emit("wordcloud:update", {
      words: updateWordCloud(),
    });
  });

  socket.on("crowd:slider:update", (data: { tempoPreference: number; energyLevel: number }) => {
    const user = users.get(socket.id);
    if (!user) return;

    crowdSliderState.tempoPreferences[user.id] = data.tempoPreference;
    crowdSliderState.energyLevels[user.id] = data.energyLevel;

    // Calculate and broadcast summary
    const tempoValues = Object.values(crowdSliderState.tempoPreferences);
    const energyValues = Object.values(crowdSliderState.energyLevels);
    const avgTempo = tempoValues.length > 0
      ? tempoValues.reduce((a, b) => a + b, 0) / tempoValues.length
      : 120;
    const avgEnergy = energyValues.length > 0
      ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
      : 5;

    const summary: CrowdSliderSummary = {
      avgTempo: Math.round(avgTempo),
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      voterCount: Math.max(tempoValues.length, energyValues.length),
    };

    io.to(user.sessionId).emit("crowd:slider:summary", summary);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      delete crowdSliderState.tempoPreferences[user.id];
      delete crowdSliderState.energyLevels[user.id];
      
      // Broadcast updated crowd slider summary
      const tempoValues = Object.values(crowdSliderState.tempoPreferences);
      const energyValues = Object.values(crowdSliderState.energyLevels);
      const avgTempo = tempoValues.length > 0
        ? tempoValues.reduce((a, b) => a + b, 0) / tempoValues.length
        : 120;
      const avgEnergy = energyValues.length > 0
        ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
        : 5;

      const summary: CrowdSliderSummary = {
        avgTempo: Math.round(avgTempo),
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        voterCount: Math.max(tempoValues.length, energyValues.length),
      };

      io.to(user.sessionId).emit("crowd:slider:summary", summary);
    }
    console.log("Client disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

