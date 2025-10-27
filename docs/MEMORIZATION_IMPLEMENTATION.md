# Simakin - Memorization Feature Implementation Guide

## 🎯 Overview

The memorization feature in Simakin uses Google Gemini AI to evaluate users' Quran recitations. This system includes:

- 🎙️ **Audio Recording**: Record recitation using browser MediaRecorder API
- 🤖 **AI Transcription**: Transcribe audio with Gemini 2.0-flash
- ✅ **AI Validation**: Validate tajweed, memorization, and waqaf with Gemini 2.5-pro
- 📊 **Scoring System**: Accuracy, tajweed, and fluency scores from AI
- 💾 **Database Storage**: Save results to MySQL with Prisma

## 📁 File Structure

```
app/
├── routes/
│   └── app/
│       └── memorization/
│           ├── index.tsx                       # History page with real data
│           ├── types.ts                        # Type definitions
│           ├── new/
│           │   ├── index.tsx                   # Loader & action for form
│           │   └── new-memorization-form.tsx   # Form component (kebab-case)
│           ├── session/
│           │   ├── index.tsx                   # Loader & action (with audio processing)
│           │   ├── memorization-session.tsx    # Recording component (kebab-case)
│           │   └── prompts.ts                  # AI prompts
│           └── result/
│               └── [id]/
│                   ├── index.tsx               # Loader for result
│                   └── memorization-result.tsx # Result display (kebab-case)
├── lib/
│   ├── db.server.ts                           # Prisma client
│   └── gemini/
│       └── gemini.ts                          # Gemini AI integration
├── services/
│   └── auth/
│       └── auth.server.ts                      # Authentication
└── app.css                                     # Global styles + Arabic font

prisma/
└── schema.prisma                              # Database schema (with TEXT fields)
```

**Note**: All component files use **kebab-case** naming convention.

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: MySQL connection string
- `GEMINI_API_KEY`: Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))
- `SESSION_SECRET`: Random string for session encryption

### 2. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

## 🚀 User Flow

```
1. /app/memorization
   ↓ (View history & stats - real data from database)
2. /app/memorization/new
   ↓ (Submit form with React Router Form component)
3. /app/memorization/session?surah=1&start=1&end=7&type=ziyadah
   ↓ (Record & submit audio via Form action)
4. Session action processes audio:
   - Authenticate user
   - Fetch Quran text from Equran API
   - Transcribe with Gemini 2.0-flash
   - Validate with Gemini 2.5-pro
   - Save to Prisma database
   - Update user stats
5. /app/memorization/result/[id]
   ↓ (View detailed results with Arabic font)
```

**Architecture Change**: No separate API route! Everything uses React Router's action functions.

## 🤖 AI Processing Pipeline

### Step 1: Transcription (Gemini 2.0-flash)

```typescript
// Input: Audio file (webm)
// Output: Exact transcription of what user recited

const transcription = await modelTranscribeQuran.transcribe([
  transcribePrompt(),
  { inlineData: { data: audioBase64, mimeType: "audio/webm" } },
]);
```

**Important**: AI transcribes **exactly** what is heard, including mistakes!

**Sequence**: Transcription MUST complete before validation starts.

### Step 2: Validation (Gemini 2.5-pro)

```typescript
// Input:
// - Audio file
// - Transcription
// - Original Quran text
// - Surah & ayah range

// Output JSON with EXACT field names:
{
  "transcription": "...",
  "kesalahan_hafalan": [
    {"ayah": 2, "type": "lafal salah", "detail": "..."}
  ],
  "kesalahan_tajwid": [
    {"ayah": 1, "type": "mad thabi'i pendek", "letter": "الرَّحْمَـٰنِ", "suggestion": "..."}
  ],
  "kesalahan_waqaf": [
    {"ayah": 3, "type": "waqaf tidak sesuai", "detail": "..."}
  ],
  "accuracy_score": 85.5,
  "tajweed_score": 78.0,
  "fluency_score": 90.0,
  "saran_umum": "...",
  "metadata_quran": {...}
}
```

**Field Names**: Use `ayah`, `type`, `letter`, `suggestion` (NOT `ayat`, `jenis`, `huruf`, `saran`)

## 📊 Score Calculation

Scores are **calculated by Gemini AI**, not hardcoded:

- **accuracy_score**: Memorization correctness (words and letters)
- **tajweed_score**: Tajweed rules application
- **fluency_score**: Fluency and confidence

Formula for total score:

```javascript
const avgScore = (accuracy_score + tajweed_score + fluency_score) / 3;
```

## 💾 Database Schema

### Recitation Table

```prisma
model Recitation {
  id        String           @id @default(cuid())
  userId    String
  surah     Int
  startAyah Int
  endAyah   Int
  mode      RecitationMode   // HAFALAN or MUROJAAH
  status    RecitationStatus // COMPLETED
  duration  Int?
  feedback  Feedback?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}
```

### Feedback Table

```prisma
model Feedback {
  id               String  @id @default(cuid())
  recitationId     String  @unique
  transcription    String? @db.Text          // TEXT type for long content
  memorizationErrs Json?   // kesalahan_hafalan array
  tajweedErrs      Json?   // kesalahan_tajwid array
  waqfErrs         Json?   // kesalahan_waqaf array
  generalAdvice    String? @db.Text          // TEXT type for long advice
  accuracyScore    Float   // accuracy_score (0-100)
  tajweedScore     Float   // tajweed_score (0-100)
  fluencyScore     Float   // fluency_score (0-100)
  metadataQuran    Json?   // metadata_quran object
  createdAt        DateTime @default(now())
}
```

**Important**: Use `@db.Text` for `transcription` and `generalAdvice` to avoid "column too long" errors.

## 🔐 Authentication

Routes **require authentication** via `requireUserId()`:

```typescript
const userId = await requireUserId(request);
```

Routes that need auth:

- `/app/memorization` - History page
- `/app/memorization/new` - Create session
- `/app/memorization/session` - Recording (action)
- `/app/memorization/result/[id]` - View result

If user not authenticated, redirects to `/auth/signin`.

## 📱 Frontend Components

### History Page (`/app/memorization/index.tsx`)

- Fetches real data from Prisma database
- Displays stats: Total Sessions, This Week, Average Accuracy
- Lists recent recitations with surah names from Equran API
- Shows ayah range, duration, and score for each session
- Grid layout with clickable cards

### NewMemorizationForm

- Select surah from dropdown (fetched from Equran API)
- Choose ayah range (dynamic validation with Zod)
- Select type (ziyadah or murojaah)
- Uses React Router `Form` component (not manual fetch)
- Preview summary before starting

### MemorizationSession

- Start/stop recording with MediaRecorder API
- Audio preview before submit
- Uses `Form` component with `encType="multipart/form-data"`
- DataTransfer API to attach audio Blob as File
- `useNavigation()` for loading states
- Auto-redirect to result page on success

### MemorizationResult

- Display 3 score cards with Lucide icons (not emoji):
  - Award icon - Accuracy
  - BookMarked icon - Tajweed
  - Zap icon - Fluency
- **General Advice** positioned at top (after scores)
- Transcription vs original text with truncation
- **Read More** button opens dialog for full text
- Dialog: max-w-7xl, responsive font sizes
- Detailed error breakdown with icons
- Arabic text with Amiri font
- Proper line-height (2.5-3) for harakat spacing

### Arabic Text Features

**Font**: Google Font "Amiri" for professional Quran display

**CSS Classes**:

```css
.arabic-text      // 1.5rem, line-height: 2.5
.arabic-text-lg   // 2rem, line-height: 3
.arabic-text-sm   // 1.125rem, line-height: 2.25
```

**Truncation Dialog**:

- Mobile: `text-xl` (20px)
- Tablet: `text-2xl` (24px)
- Desktop: `text-3xl` (30px)
- Line-height: 2.5-3 (prevents harakat overlap)
- Width: 95vw → 7xl (1280px) responsive
- Height: 85vh scrollable

## 🎨 UI Components Used

From shadcn/ui:

- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button, Badge, Input, Select, Form
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
- Spinner (loading states)
- Alert (errors)

From Lucide React:

- Target, Award, Zap, BookMarked (score icons)
- AlertCircle, Lightbulb, Clock (section icons)
- BookOpen, Maximize2 (dialog icons)
- ArrowLeft, Calendar (navigation icons)

## 🚨 Error Handling

### Frontend

- Microphone permission denied
- No audio recorded
- Network errors during submission
- Invalid parameters
- Form validation errors (Zod)

### Backend

- Missing FormData fields
- Equran API failures
- Gemini API errors (quota, parsing)
- Database errors (Prisma)
- JSON parsing errors from AI response
- **Column too long**: Use `@db.Text` in schema
- Authentication failures

### Common Fixes

**"Column too long for generalAdvice"**:

```prisma
generalAdvice String? @db.Text
transcription String? @db.Text
```

**"404 on /api/memorization"**:

- Don't use separate API routes
- Use action functions in session/index.tsx

**"Field name mismatch"**:

- AI must return: `ayah`, `type`, `letter`, `suggestion`
- NOT: `ayat`, `jenis`, `huruf`, `saran`

## 🧪 Testing

### Manual Testing Steps

1. Login with valid account
2. Navigate to `/app/memorization/new`
3. Select surah, ayah range, and type
4. Click "Start Session"
5. Grant microphone permission
6. Record 5-10 seconds of Quran recitation
7. Click "Submit Audio"
8. Wait for AI processing (~10-30 seconds)
9. Verify redirect to result page
10. Check scores and errors display

### Database Verification

```bash
npx prisma studio
```

Check:

- Recitation created with correct data
- Feedback linked to recitation
- User totalSessions incremented
- User totalScore updated

## 📚 External APIs

### Equran API

- Endpoint: `https://equran.id/api/v2/surat/{surahNumber}`
- Purpose: Fetch surah data and ayat text
- Free, no API key required

### Google Gemini AI

- Models:
  - `gemini-2.0-flash`: Fast transcription
  - `gemini-2.5-pro`: Detailed validation
- Requires: `GEMINI_API_KEY`
- Rate limits: Check Google AI Studio

## 🔄 Recent Updates & Features

### ✅ Completed

- [x] Gemini AI system instruction updated for consistent field names
- [x] Prisma TEXT fields for long content (transcription, generalAdvice)
- [x] React Router Form pattern (no separate API routes)
- [x] Arabic font (Amiri) with proper line-height for harakat
- [x] Truncated text with "Read More" dialog
- [x] Responsive modal width (95vw → 7xl)
- [x] Icon-based UI (replaced emoji with Lucide icons)
- [x] General Advice repositioned to top
- [x] History page with real database data
- [x] User stats auto-update (totalSessions, totalScore)
- [x] Responsive font sizes for mobile/desktop
- [x] DataTransfer API for file upload in Form
- [x] useNavigation for loading states

### 🔄 Future Improvements

- [ ] Audio file upload to cloud storage (S3/Cloudinary)
- [ ] Real-time transcription feedback
- [ ] Comparison with professional Qari recordings
- [ ] Progress tracking over time (charts)
- [ ] Leaderboard integration
- [ ] Achievement system
- [ ] Multi-language support (English, Arabic)
- [ ] Offline mode with service workers
- [ ] Export results to PDF
- [ ] Share results on social media
- [ ] Voice feedback from AI (TTS)

## 🐛 Troubleshooting

### Audio recording not working

- Check browser compatibility (Chrome/Edge recommended)
- Verify HTTPS connection (required for MediaRecorder)
- Check microphone permissions in browser settings

### Gemini API errors

- Verify API key is valid and active
- Check quota limits in Google AI Studio
- Ensure audio file < 20MB
- Review system instructions for field names

### Database connection errors

- Verify DATABASE_URL format: `mysql://user:password@localhost:3306/dbname`
- Check MySQL server is running
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations

### TypeScript errors

- Run `pnpm install` to update dependencies
- Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")
- Check import paths use `~/` not `@/` or relative paths
- Verify all component files use kebab-case

### UI/CSS issues

**Arabic text not showing**:

- Check font loaded: `font-family: 'Amiri'`
- Verify `dir="rtl"` and `lang="ar"` attributes
- Check `.arabic-text` classes in app.css

**Harakat overlapping**:

- Increase line-height in CSS (2.5-3)
- Use `leading-[2.5]` or higher in Tailwind

**Modal too narrow**:

- Use responsive breakpoints: `sm:max-w-[90vw] lg:max-w-7xl`
- Override default dialog max-width

**Text too long in cards**:

- Implement truncation with "Read More" dialog
- Set maxLength prop (default 200 chars)

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review code comments in files
3. Check Prisma logs: `npx prisma studio`
4. Review browser console for errors

---

**Built with ❤️ using React Router v7, Prisma, Tailwind CSS, and Google Gemini AI**
