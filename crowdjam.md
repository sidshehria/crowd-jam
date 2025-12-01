# Project: CrowdJam Live – Real-Time Collective Music Creation MVP

## 1. High-Level Vision

We are building **CrowdJam Live**, an MVP for a **real-time collaborative music creation platform** where:

- A **producer** runs a live music session (e.g., in Ableton / FL / Logic).
- **Audience members** join a session, submit ideas (tempo, mood, lyrics, instruments), and **vote** on each other’s ideas.
- A **live word cloud** and **sliders** show the collective direction of the crowd.
- A basic **speech-to-text pipeline** lets users speak ideas that get converted to text suggestions.
- Optional: **AI-assisted suggestions** for BPM, chord progressions, and stems (mocked or via OpenAI).

This MVP shows the **end-to-end system** that maps crowd input → actionable information that the producer can use in their DAW.

The focus is on:
- **Real-time systems**
- **WebSockets**
- **React/Next.js + Node.js**
- **Low-latency UI updates**
- **Basic AI/ML integration + speech-to-text**

---

## 2. Tech Stack

**Frontend**
- Framework: **Next.js 14** (App Router, TypeScript)
- UI: **React**, Tailwind CSS
- Real-time: **socket.io-client**
- Speech-to-text: **Web Speech API** in the browser (for MVP; later replaceable with Whisper)

**Backend**
- Runtime: **Node.js** (TypeScript)
- Framework: **Express**
- Real-time: **socket.io** WebSocket server
- In-memory data store for MVP (no database needed; optimize for speed of prototyping)
- Optional AI: **OpenAI API** (env: `OPENAI_API_KEY`) for suggestion generation

**Project structure (monorepo in a single repo)**
- `/server` – Node.js + Express + Socket.io backend
- `/web` – Next.js frontend

---

## 3. Core MVP Features

### 3.1 Roles & Sessions

- Single MVP session: `sessionId = "global-jam"` (hardcoded for now).
- Users choose a **role** when joining:
  - `Audience` – can send text/voice suggestions, vote, chat.
  - `Producer` – sees an enhanced dashboard with top suggestions, word cloud, crowd slider stats.

### 3.2 Audience Features

1. **Join Session**
   - Simple join screen:
     - Enter display name.
     - Choose role: `Audience` or `Producer`.
   - On join, connect to WebSocket and join room `global-jam`.

2. **Submit Suggestions**
   - Suggestion categories:
     - `tempo`
     - `mood`
     - `lyrics`
     - `instrumentation`
     - `other`
   - Fields:
     - `text` (string)
     - `category` (enum)
   - Emit event: `suggestion:new`.

3. **Vote on Suggestions**
   - For each suggestion in the feed:
     - Show upvote button.
   - Emit event: `suggestion:vote`.
   - Votes update in real time for all clients.

4. **Chat + Word Cloud Source**
   - Simple chat input for text messages.
   - Emit event: `chat:message`.
   - Server will use chat messages + suggestion text to drive word cloud.

5. **Crowd Sliders**
   - Two sliders (client-side inputs):
     - Tempo preference (60–180 BPM).
     - Energy (1–10).
   - Emit event: `crowd:slider:update` with:
     - `tempoPreference`
     - `energyLevel`.

6. **Voice Input → Text Suggestion (Speech-to-Text)**
   - Use **Web Speech API** on the client:
     - Microphone button to start/stop recognition.
     - Recognized text appears in suggestion input.
     - User can edit then submit as suggestion.
   - This demonstrates a **live speech-to-text pipeline** without needing server-side Whisper.

---

### 3.3 Producer Features

1. **Producer Dashboard View**
   - After joining as `Producer`, show a dedicated dashboard:
     - Panel: **Top Suggestions by Category** (sorted by votes).
     - Panel: **Live Word Cloud** (from aggregated words).
     - Panel: **Crowd Sliders Summary**:
       - Aggregated median/average `tempoPreference`.
       - Aggregated median/average `energyLevel`.
     - Panel: **Selected Suggestions** (items the producer has chosen to act on).

2. **Suggestion Actions**
   - Producer can:
     - Mark suggestion as `selected`.
     - Mark suggestion as `rejected`.
   - Emit event: `suggestion:status:update`.
   - Audience sees a tag like `Selected by Producer` or `Rejected`.

3. **AI-Assisted Suggestions**
   - Button: `Generate AI Suggestion`.
   - Options for category (e.g., `tempo`, `chord progression`, `lyrics`).
   - On click:
     - Call backend REST endpoint `/ai/suggest`.
     - If `OPENAI_API_KEY` exists:
       - Call OpenAI (e.g. GPT-4o-mini) with prompt: _“Given current crowd mood and top suggestions, propose a [category] idea...”_.
       - Return `text` suggestion.
     - If no API key:
       - Return a mocked suggestion (hardcoded samples).
   - The returned AI suggestion shows up like any other suggestion but tagged `AI`.

4. **DAW Integration Placeholder**
   - In dashboard, show a **“To-DAW Actions”** list populated by selected suggestions.
   - Buttons like:
     - `Copy as Notes` (copies text to clipboard).
     - `Export as JSON` (optional – just triggers download from frontend).
   - This illustrates how the system could later integrate with Ableton/FL/Logic via plugins or scripting.

---

### 3.4 Real-Time Word Cloud

- Server maintains a rolling window of last N messages + suggestions (e.g., last 200).
- Basic word processing:
  - Lowercase, strip punctuation.
  - Remove stopwords (simple static list).
- Count word frequencies.
- Broadcast word frequencies on regular interval (e.g., every 2 seconds) or on every new message/suggestion.
- Frontend displays a simple word cloud:
  - Each word’s font size proportional to its frequency.

---

## 4. Backend Design (`/server`)

### 4.1 Setup

- Node.js + TypeScript project.
- Dependencies:
  - `express`
  - `http`
  - `socket.io`
  - `cors`
  - `dotenv`
  - `openai` (for AI suggestions; optional)
- Entry file: `src/index.ts`

### 4.2 Data Models (In-Memory)

Use simple TypeScript interfaces and in-memory maps:

```ts
type Role = "audience" | "producer";

interface User {
  id: string;           // socket.id
  name: string;
  role: Role;
  sessionId: string;
}

type SuggestionCategory =
  | "tempo"
  | "mood"
  | "lyrics"
  | "instrumentation"
  | "other";

interface Suggestion {
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

interface ChatMessage {
  id: string;
  sessionId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

interface CrowdSliderState {
  tempoPreferences: Record<string, number>; // userId -> tempo
  energyLevels: Record<string, number>;     // userId -> energy
}

4.3 WebSocket Events

Namespace: /ws (or default namespace).

On connection

Client sends session:join with payload:

{
  name: string;
  role: "audience" | "producer";
  sessionId: string; // "global-jam"
}


Server:

Create User entry.

Join socket room sessionId.

Emit session:state:init to this client:

Current suggestions

Current chat (last 50 messages)

Aggregated crowd slider stats

Current word cloud data

Events (client → server)

suggestion:new

{
  category: SuggestionCategory;
  text: string;
}


suggestion:vote

{
  suggestionId: string;
}


suggestion:status:update (Producer only)

{
  suggestionId: string;
  status: "selected" | "rejected";
}


chat:message

{
  text: string;
}


crowd:slider:update

{
  tempoPreference: number;  // 60–180
  energyLevel: number;      // 1–10
}


Events (server → clients in room)

suggestion:created – new suggestion

suggestion:updated – votes or status changed

chat:message – new chat

crowd:slider:summary – aggregated stats

{
  avgTempo: number;
  avgEnergy: number;
  voterCount: number;
}


wordcloud:update – word frequency data:

{
  words: { text: string; count: number }[];
}

4.4 REST Endpoints

Base URL: http://localhost:4000

GET /health – returns { status: "ok" }.

POST /ai/suggest

Body:

{
  "category": "tempo | mood | lyrics | instrumentation | other",
  "context": {
    "topWords": string[],
    "avgTempo": number,
    "avgEnergy": number
  }
}


If OPENAI_API_KEY is set:

Call OpenAI with a short prompt and return a single suggestion string.

Else:

Return a mocked suggestion.

Response:

{
  "text": "AI generated suggestion string"
}

5. Frontend Design (/web)
5.1 Setup

Next.js 14 (App Router) + TypeScript.

Tailwind CSS for styling.

socket.io-client for real-time.

Directory structure:

/app/page.tsx – Landing / join page.

/app/session/page.tsx – Main session page (role-based view).

/components/... – reusable components.

/lib/socket.ts – socket.io-client initializer.

/lib/types.ts – shared types mirrored from backend (duplicated or manually synced).

5.2 Pages & Views
5.2.1 Landing / Join Page

Simple form:

name text input.

Role toggle (Audience / Producer).

Join button.

On submit:

Store user info in context or localStorage.

Navigate to /session.

5.2.2 Session Page Layout

Layout

If role = Audience:

Left: Suggestion input + list

Category dropdown

Textarea

Submit button

Middle: Live suggestions feed (with votes).

Right:

Chat box

Crowd sliders (tempo + energy)

Word cloud mini-panel (read-only view).

If role = Producer:

Top: Aggregated crowd sliders (avg tempo, avg energy).

Left: Top suggestions by category (sortable).

Middle: Word cloud (large).

Right: Selected suggestions + AI suggestion generator panel.

5.3 Components

Create reusable components:

components/JoinForm.tsx

components/SuggestionInput.tsx

components/SuggestionList.tsx

components/ChatPanel.tsx

components/CrowdSliders.tsx

components/WordCloud.tsx

components/ProducerDashboard.tsx

components/AudienceView.tsx

components/MicInput.tsx (Speech-to-text button + status)

6. Speech-to-Text (Client-Side only)

Implement a small hook and component:

Hook useSpeechToText:

Uses window.SpeechRecognition or webkitSpeechRecognition.

Exposes:

isSupported

isListening

transcript

startListening()

stopListening()

MicInput component:

Button: toggles listening.

When transcript is ready, send it to parent to prefill suggestion text.

This satisfies “Speech-to-text pipeline for live collective voice input” in an MVP-friendly way.

7. AI Suggestion Integration

Backend:

Implement /ai/suggest using OpenAI.

Use short prompts, e.g.:

“You are helping a music producer in a live crowd-sourced music session. Crowd mood words: [list]. Average tempo: X BPM. Average energy: Y/10. Suggest a short [category] idea that fits this vibe. Keep it under 20 words.”

Frontend:

Producer dashboard has AI Suggestion panel:

Dropdown for category.

Button Generate.

Show loading state.

On response, show AI suggestion with Add to Suggestions button:

Calls WebSocket event suggestion:new with source = "ai".