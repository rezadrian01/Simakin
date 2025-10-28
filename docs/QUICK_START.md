# ⚡ Quick Start - Memorization Feature

## 🚀 Running the Application

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env and add:
# - DATABASE_URL (MySQL connection)
# - GEMINI_API_KEY (from https://aistudio.google.com/app/apikey)
# - SESSION_SECRET (random string)

# 3. Setup database
npx prisma generate
npx prisma migrate dev

# 4. Run development server
pnpm dev

# Open http://localhost:5173
```

## 📝 Testing the Feature

1. **Login** → `/auth/signin` (or signup if needed)
2. **Create Session** → `/app/memorization/new`
   - Select surah (e.g., "Al-Fatihah")
   - Choose ayah range (e.g., 1-7)
   - Select type (Ziyadah/Murojaah)
3. **Record Audio** → Click "Mulai Rekaman"
   - Grant microphone permission
   - Recite 5-10 seconds
   - Click "Berhenti Rekaman"
4. **Submit** → Click "Kirim Rekaman"
   - Wait ~10-30 seconds for AI processing
   - Auto-redirects to result page
5. **View Results** → See scores and detailed feedback

## 🔑 Key Endpoints

- **Form**: `/app/memorization/new`
- **Session**: `/app/memorization/session?surah=1&start=1&end=7&type=ziyadah`
- **API**: `/api/memorization` (POST with FormData)
- **Result**: `/app/memorization/result/[id]`

## 📊 What Gets Saved to Database

```sql
-- Recitation table
INSERT INTO Recitation (
  userId,
  surah,
  startAyah,
  endAyah,
  mode,        -- 'ZIYADAH' or 'MUROJAAH'
  status,      -- 'COMPLETED'
  duration     -- in seconds
)

-- Feedback table (automatically linked)
INSERT INTO Feedback (
  recitationId,
  transcription,        -- What user said
  memorizationErrs,     -- JSON array
  tajweedErrs,          -- JSON array
  waqfErrs,             -- JSON array
  generalAdvice,        -- String
  accuracyScore,        -- Float (0-100)
  tajweedScore,         -- Float (0-100)
  fluencyScore,         -- Float (0-100)
  metadataQuran         -- JSON object
)

-- User stats updated
UPDATE User SET
  totalSessions = totalSessions + 1,
  totalScore = totalScore + avgScore
WHERE id = userId
```

## 🤖 AI Models Used

| Model            | Purpose              | Speed              |
| ---------------- | -------------------- | ------------------ |
| gemini-2.0-flash | Transcription        | Fast (~5-10s)      |
| gemini-2.5-pro   | Validation & Scoring | Moderate (~15-20s) |

## ✅ Success Indicators

1. ✅ No TypeScript errors
2. ✅ Audio recording works (check browser console)
3. ✅ Form submits successfully
4. ✅ API returns `recitationId`
5. ✅ Redirects to result page
6. ✅ Scores displayed (accuracy, tajweed, fluency)
7. ✅ Data saved in database (check Prisma Studio)

## 🐛 Common Issues

| Problem                        | Solution                                  |
| ------------------------------ | ----------------------------------------- |
| "Microphone permission denied" | Allow microphone in browser settings      |
| "GEMINI_API_KEY not found"     | Add to .env file                          |
| "Database connection failed"   | Check DATABASE_URL in .env                |
| "User not authenticated"       | Login first at /auth/signin               |
| "Audio file too large"         | Keep recording under 60 seconds           |
| "JSON parsing error"           | Gemini response format issue - check logs |

## 📦 Dependencies

```json
{
  "dependencies": {
    "@google/genai": "^0.x.x",
    "@prisma/client": "^6.x.x",
    "react-router": "^7.x.x",
    "zod": "^3.x.x",
    "react-hook-form": "^7.x.x"
  }
}
```

## 🔍 Debugging

```bash
# View database
npx prisma studio

# Check backend logs
# Look for console.log in terminal

# Check Gemini API response
# Look for "Starting transcription..." and "Memorization validation successful" in logs

# View network requests
# Open browser DevTools → Network tab → Filter: Fetch/XHR
```

## 📚 Further Reading

- Full documentation: `docs/MEMORIZATION_IMPLEMENTATION.md`
- Prisma schema: `prisma/schema.prisma`
- Type definitions: `app/routes/app/memorization/types.ts`
- API implementation: `app/routes/api.memorization.ts`

---

**Need help?** Check console logs, Prisma Studio, and browser DevTools! 🚀
