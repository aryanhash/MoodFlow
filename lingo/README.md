# Lingo CLI Scenarios

The `lingo` directory now ships with scripted demos so you can exercise the
multilingual flows from a single command. Each scenario uses the real
Lingo.dev APIs (unless you swap in the mock client) and mirrors the web UI.

> All commands assume you are at the repository root (`MoodLiftMeals/`). Make
> sure `LINGO_API_KEY` is available in your environment before running them.

## Available Stories

### 1. Mood Check-In (Text ➜ Empathy Summary)
```bash
lingo test scenarios/mood-text.json
```
**Demonstrates**
- Text mood detection in Spanish → auto-detected/translated to English
- Crisis keyword detection + helpline surfacing
- Localized mood summary returned in Spanish
- TTS endpoint invoked for localized audio (stubbed URL in demo)

### 2. Voice Check-In (Audio ➜ Translation)
```bash
lingo test scenarios/mood-voice.json
```
**Demonstrates**
- Uploading an audio fixture (Hindi) for speech-to-text
- Mood fusion with translated transcript
- Crisis streak accumulation over the last 3 entries
- Peer-support CTA toggle when streak threshold is met

### 3. Empathy Chat Companion
```bash
lingo test scenarios/chat-empathy.json
```
**Demonstrates**
- Multilingual back-and-forth (user in Arabic, GPT responses localized)
- Crisis keyword detection mid-chat → helpline suggestion
- Peer-support suggestion after repeated negative entries
- Chat history persistence preview

### 4. Peer Support Matching (Stub)
```bash
lingo test scenarios/peer-support.json
```
**Demonstrates**
- Peer matchmaking by language & experience tags (stub data)
- Translated introductions + moderation flag example
- Bidirectional translation with moderation notice when blocklist triggered

### 5. Crisis SMS Stub
```bash
lingo test scenarios/crisis-sms.json
```
**Demonstrates**
- Simulated SMS queue for helpline nudge (console output)
- Returns stubbed success payload for CLI verification

## Scenario File Anatomy

You can inspect the JSON fixtures in `lingo/scenarios/`. Each file documents:

- `name`: human-readable title shown by the CLI
- `steps`: ordered list of HTTP requests, console assertions, and notes
- `env`: optional overrides (e.g., forcing `lingoClient.mock` usage)

Feel free to copy/modify these to craft additional demos.

## Running All Demos Sequentially

```bash
lingo test scenarios --all
```

This runs each JSON scenario front-to-back and prints a summary report showing
latency, translation confidence, and any flagged crisis keywords.

## Troubleshooting

- **Missing API key** → ensure `LINGO_API_KEY` and `VITE_LINGO_API_KEY` are set.
- **Network errors** → the CLI is online-first; retry or swap to mocks by
  overriding `LINGO_USE_MOCK=true` inside a scenario.
- **Audio fixtures** → recorded samples live in `lingo/assets/`. Replace with
  your own to test additional languages.

Happy demoing! 🚀
