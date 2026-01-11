# MyDiary - AI-Powered Smart Diary App

An intelligent diary application built with Expo and React Native that helps you record daily experiences, improve your writing, extract learnings, and track personal growth.

## Features

✨ **Smart Writing Assistant**
- Voice or text input for diary entries
- AI-powered paraphrasing that preserves meaning while improving grammar
- Side-by-side comparison of original and improved text

🧠 **Learning Extraction**
- Automatic extraction of key learnings from diary entries
- 16 categorized learning types (Work, Personal Life, Health, etc.)
- User approval and editing before saving

💡 **AI Suggestions**
- What went well/wrong analysis
- Failure analysis and improvement suggestions
- Personalized feedback for each entry

📈 **Progress Tracking**
- Daily life progress score (diary-based)
- Task performance score
- Visual graphs showing growth over time
- AI comparison with past entries (+1, 0, -1 scoring)

✅ **Task Management**
- Create tasks with deadlines and reminders
- Track completion status
- Contributes to progress score

🎨 **Beautiful UI**
- Dark mode design
- Context-aware images for each diary entry
- Smooth animations and transitions

## Tech Stack

- **Framework**: Expo SDK 52 + React Native
- **Language**: TypeScript
- **AI**: Google Gemini 2.0 Flash (with multi-key failover)
- **Database**: SQLite (local-first, privacy-focused)
- **Navigation**: React Navigation
- **Charts**: React Native Chart Kit

## Setup

1. **Clone and install dependencies**:
```bash
cd MyDiary
npm install
```

2. **Add your Gemini API keys**:
   - Run the app and go to Settings tab
   - Tap "Manage API Keys"
   - Add one or more Gemini API keys (comma or newline separated)
   - The app will automatically rotate through keys if one fails

3. **Run the app**:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Usage

### Creating a Diary Entry

1. Tap the **+** button on the Diary tab
2. Write or speak your diary entry
3. Tap **"Improve Writing"** to paraphrase with AI
4. Review and edit the improved version
5. Tap **"Save Diary"**
6. Review and approve extracted learnings
7. View AI suggestions for the day

### Viewing Learnings

- Go to the **Learnings** tab
- Filter by category (Work, Personal Life, Health, etc.)
- Tap any learning to jump to the linked diary entry

### Tracking Progress

- Go to the **Progress** tab
- View your current cumulative score
- Switch between Diary Progress and Task Progress graphs
- AI compares each entry with past entries to calculate growth

### Managing Tasks

- Go to the **Tasks** tab
- Tap **+** to create a new task
- Set title, description, deadline, and reminder
- Check off tasks when complete

## API Key Management

The app supports multiple Gemini API keys for:
- **Rate limiting**: Automatically rotates through keys
- **Failover**: If one key fails, tries the next one
- **Redundancy**: Never lose functionality due to quota limits

## Privacy

- All diary data stored locally in SQLite
- No cloud sync (your data stays on your device)
- API keys stored securely in AsyncStorage

## Architecture

```
src/
├── components/          # Reusable UI components
├── database/
│   ├── repositories/    # Data access layer
│   ├── schema.ts        # TypeScript types & SQL schema
│   └── db.ts           # Database initialization
├── navigation/          # React Navigation setup
├── screens/            # All app screens
│   ├── diary/
│   ├── learnings/
│   ├── progress/
│   ├── tasks/
│   └── settings/
├── services/
│   ├── ai/             # Gemini AI integrations
│   ├── speech/         # Speech-to-text
│   └── storage/        # API key storage
└── utils/              # Helper functions & constants
```

## Core Philosophy

- **User Control**: AI assists, never overrides user intent
- **Privacy First**: All data remains local
- **Meaning Preservation**: AI improves writing without changing meaning
- **Explicit Approval**: User always has final say on learnings and edits
- **Traceability**: Maintain links between diary, learnings, and progress

## License

MIT

## Author

Built with ❤️ using Expo and Google Gemini AI
