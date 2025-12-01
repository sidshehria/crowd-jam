# CrowdJam Web

Frontend Next.js application for CrowdJam Live.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` - Join page (enter name and role)
- `/session` - Main session page (role-based view)

## Components

- `JoinForm` - Join session form
- `SuggestionInput` - Submit new suggestions
- `SuggestionList` - Display and vote on suggestions
- `ChatPanel` - Real-time chat
- `CrowdSliders` - Tempo and energy preference sliders
- `WordCloud` - Visual word frequency display
- `ProducerDashboard` - Enhanced producer view
- `AudienceView` - Standard audience view
- `MicInput` - Speech-to-text input button

## Features

- Real-time WebSocket communication
- Speech-to-text using Web Speech API
- Responsive design with Tailwind CSS
- Role-based UI rendering

## Browser Support

- Chrome/Edge: Full support including speech-to-text
- Firefox: Full support (speech-to-text may vary)
- Safari: Basic support (speech-to-text not available)

