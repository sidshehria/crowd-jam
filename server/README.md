# CrowdJam Server

Backend server for CrowdJam Live - Real-time collaborative music creation platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here  # Optional
   FRONTEND_URL=http://localhost:3000
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### POST /ai/suggest
Generate AI-powered music suggestion.

**Request Body:**
```json
{
  "category": "tempo | mood | lyrics | instrumentation | other",
  "context": {
    "topWords": ["word1", "word2"],
    "avgTempo": 120,
    "avgEnergy": 5
  }
}
```

**Response:**
```json
{
  "text": "AI generated suggestion string"
}
```

## WebSocket Events

### Client → Server

- `session:join` - Join a session
- `suggestion:new` - Create new suggestion
- `suggestion:vote` - Vote on suggestion
- `suggestion:status:update` - Update suggestion status (Producer only)
- `chat:message` - Send chat message
- `crowd:slider:update` - Update tempo/energy preferences

### Server → Client

- `session:state:init` - Initial session state
- `suggestion:created` - New suggestion created
- `suggestion:updated` - Suggestion updated
- `chat:message` - New chat message
- `wordcloud:update` - Word cloud data update
- `crowd:slider:summary` - Aggregated slider statistics

## Architecture

- **In-memory storage**: Uses Maps and arrays for data persistence (MVP)
- **Word cloud processing**: Analyzes last 200 messages + all suggestions
- **Real-time updates**: Socket.io rooms for session isolation

