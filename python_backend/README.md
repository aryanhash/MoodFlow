# Python Backend Setup Instructions

## Installation

1. Install Python dependencies:
   ```bash
   npm run install:python
   ```
2. Provide your Lingo.dev API key via the `LINGO_API_KEY` environment variable (see `/lingo/README.md`).

## Development

Start the Python FastAPI backend:
```bash
npm run dev:python
```

The API will be available at `http://localhost:5000`

## Production

Build the frontend and start the Python backend:
```bash
npm run build:python
npm run start:python
```

## API Endpoints

All endpoints match the original Node.js/Express API, plus the new Lingo-powered flows:

- `POST /api/mood/detect` - Detect mood (text/voice/photo) with multilingual translation, crisis detection, and helpline lookup
- `GET /api/mood/latest` - Get latest mood entry
- `GET /api/mood/history` - Get mood history
- `GET /api/tasks` - Get tasks (optionally by mood)
- `PATCH /api/tasks/{id}` - Update task completion
- `POST /api/tasks` - Create new task
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update user settings
- `POST /api/chat/empathy` - AI companion chat with translation + crisis keyword detection
- `POST /api/mood/tts` - Text-to-speech helper for localized mood summaries
- `POST /api/support/sms` - Crisis support SMS (stubbed for demos)
- `POST /api/peers/match` - Peer support matchmaking (stubbed for demos)
- `POST /api/peers/chat` - Peer chat translation + moderation (stubbed)
- `GET /api/peers/session/{sessionId}` - Retrieve current peer session transcript (stubbed)

## Features

- ✅ FastAPI with automatic API documentation
- ✅ Pydantic models for data validation
- ✅ In-memory storage (same as original) with crisis/peer metadata
- ✅ Mood analysis with text sentiment & language translation
- ✅ Mock face analysis
- ✅ Crisis detection, helpline lookups, and peer support stubs
- ✅ CORS support for frontend
- ✅ Static file serving for React frontend
- ✅ Error handling and validation
