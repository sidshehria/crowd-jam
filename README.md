# CrowdJam Live - Real-Time Collective Music Creation MVP

A real-time collaborative music creation platform where producers and audience members work together to create music through suggestions, voting, and live feedback.

## Features

- **Real-time Collaboration**: WebSocket-based real-time updates for suggestions, votes, and chat
- **Role-based Views**: Separate interfaces for Audience and Producer roles
- **Suggestion System**: Submit, vote, and manage music suggestions by category (tempo, mood, lyrics, instrumentation)
- **Live Word Cloud**: Visual representation of crowd sentiment from chat and suggestions
- **Crowd Sliders**: Real-time tempo and energy level preferences from the audience
- **Speech-to-Text**: Voice input for suggestions using Web Speech API
- **AI Suggestions**: Optional OpenAI integration for AI-generated music suggestions
- **Producer Dashboard**: Enhanced view with aggregated stats and selected suggestions

## Tech Stack

### Backend (`/server`)
- Node.js + TypeScript
- Express.js
- Socket.io (WebSocket server)
- OpenAI API (optional)

### Frontend (`/web`)
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Socket.io Client
- Web Speech API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) OpenAI API key for AI suggestions

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../web
   npm install
   ```

4. **Set up environment variables:**

   Create `server/.env`:
   ```env
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key_here  # Optional
   FRONTEND_URL=http://localhost:3000
   ```

   Create `web/.env.local` (optional):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:4000`

2. **Start the frontend (in a new terminal):**
   ```bash
   cd web
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **Join Session:**
   - Enter your display name
   - Choose your role: `Audience` or `Producer`
   - Click "Join Session"

2. **As Audience:**
   - Submit suggestions with category and text
   - Use the microphone button for voice input
   - Vote on suggestions
   - Chat with other participants
   - Adjust tempo and energy sliders
   - View live word cloud

3. **As Producer:**
   - View aggregated crowd preferences
   - See top suggestions by category
   - Large word cloud visualization
   - Select or reject suggestions
   - Generate AI suggestions (if API key is configured)
   - Export selected suggestions as JSON or copy as notes

## Project Structure

```
crowd-jam/
├── server/                 # Backend server
│   ├── src/
│   │   ├── index.ts       # Express + Socket.io server
│   │   ├── types.ts       # TypeScript type definitions
│   │   └── store.ts       # In-memory data store
│   ├── package.json
│   └── tsconfig.json
├── web/                    # Frontend Next.js app
│   ├── app/
│   │   ├── page.tsx       # Join page
│   │   ├── session/
│   │   │   └── page.tsx   # Main session page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/         # React components
│   ├── lib/               # Utilities and types
│   ├── hooks/             # Custom React hooks
│   └── package.json
└── README.md
```

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- The MVP uses in-memory storage (no database). Data is lost on server restart.
- Speech-to-text uses the browser's Web Speech API (Chrome/Edge recommended).
- AI suggestions fall back to mock data if OpenAI API key is not provided.
- The session ID is hardcoded to `"global-jam"` for the MVP.

## Future Enhancements

- Database persistence (PostgreSQL/MongoDB)
- Multiple concurrent sessions
- User authentication
- Real DAW integration (Ableton/FL Studio plugins)
- Server-side Whisper for better speech-to-text
- More sophisticated word cloud algorithms
- Real-time audio streaming

## License

ISC

