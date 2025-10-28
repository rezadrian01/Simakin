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

### First-Time User Flow (with Onboarding)

1. **Signup** → `/auth/signup`

   - Fill in: Full Name, Username, Email, Password
   - Click "Daftar"
   - **Auto-redirects to** → `/app/onboarding`

2. **Complete Onboarding** → `/app/onboarding`

   - **Section 1**: Select referral source (Instagram, TikTok, Friend, etc.)
   - **Section 2**: Enter memorized pages (e.g., "1-301, 500-604")
   - Click "Selesai & Mulai" (AI processes ~5-15s)
   - **Redirects to** → `/app/dashboard`
   - _(Or click "Lewati" to skip and complete later)_

3. **Create Session** → `/app/memorization/new`

   - Select surah (e.g., "Al-Fatihah")
   - Choose ayah range (e.g., 1-7)
   - Select type (Ziyadah/Murojaah)

4. **Record Audio** → Click "Mulai Rekaman"

   - Grant microphone permission
   - Recite 5-10 seconds
   - Click "Berhenti Rekaman"

5. **Submit** → Click "Kirim Rekaman"

   - Wait ~10-30 seconds for AI processing
   - Auto-redirects to result page

6. **View Results** → See scores and detailed feedback

### Existing User Flow (Already Onboarded)

1. **Login** → `/auth/signin`

   - Enter Email/Username + Password
   - **Redirects to** → `/app/dashboard` (skips onboarding)

2. **Follow steps 3-6 above**

## 🔑 Key Endpoints

- **Onboarding**: `/app/onboarding` (first-time users only)
- **Dashboard**: `/app/dashboard`
- **Form**: `/app/memorization/new`
- **Session**: `/app/memorization/session?surah=1&start=1&end=7&type=ziyadah`
- **API**: `/api/memorization` (POST with FormData)
- **Result**: `/app/memorization/result/[id]`

## 📊 What Gets Saved to Database

### Onboarding Data

```sql
-- UserProfile (referral tracking)
UPDATE UserProfile SET
  referralSource = 'INSTAGRAM',  -- or other source
  referralOther = NULL            -- or custom text if OTHER
WHERE userId = userId

-- UserMemorization (parsed from page ranges)
INSERT INTO UserMemorization (
  userId,
  surah,           -- e.g., 1 (Al-Fatihah)
  startAyah,       -- e.g., 1
  endAyah,         -- e.g., 7
  source,          -- 'ONBOARDING'
  status,          -- 'COMPLETED'
  completedAt      -- timestamp
)
-- Multiple records created for all page ranges
```

### Recitation Session Data

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

| Model                | Purpose              | Speed              |
| -------------------- | -------------------- | ------------------ |
| gemini-2.0-flash-exp | Page Range Parsing   | Fast (~5-10s)      |
| gemini-2.0-flash     | Transcription        | Fast (~5-10s)      |
| gemini-2.5-pro       | Validation & Scoring | Moderate (~15-20s) |

**Note**: Onboarding uses `gemini-2.0-flash-exp` to convert Qur'an page numbers (Mushaf Rasm Utsmani) to structured surah/ayah data.

## ✅ Success Indicators

1. ✅ No TypeScript errors
2. ✅ Audio recording works (check browser console)
3. ✅ Form submits successfully
4. ✅ API returns `recitationId`
5. ✅ Redirects to result page
6. ✅ Scores displayed (accuracy, tajweed, fluency)
7. ✅ Data saved in database (check Prisma Studio)

## 🐛 Common Issues

| Problem                            | Solution                                        |
| ---------------------------------- | ----------------------------------------------- |
| "Redirected to onboarding again"   | Check UserProfile.referralSource in DB          |
| "Onboarding page shows type error" | Run `npm run build` to generate route types     |
| "Page parsing takes too long"      | Use smaller ranges (e.g., 1-100 instead of all) |
| "Microphone permission denied"     | Allow microphone in browser settings            |
| "GEMINI_API_KEY not found"         | Add to .env file                                |
| "Database connection failed"       | Check DATABASE_URL in .env                      |
| "User not authenticated"           | Login first at /auth/signin                     |
| "Audio file too large"             | Keep recording under 60 seconds                 |
| "JSON parsing error"               | Gemini response format issue - check logs       |

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

- **Onboarding System**: `docs/ONBOARDING_SYSTEM.md` - Referral tracking & page input
- **Memorization Implementation**: `docs/MEMORIZATION_IMPLEMENTATION.md` - Full feature docs
- **Memorization Tracking**: `docs/MEMORIZATION_TRACKING.md` - History & overlap detection
- **EXP System**: `docs/EXP_SYSTEM.md` - Gamification & leveling
- **Streak System**: `docs/STREAK_IMPLEMENTATION.md` - Daily streak logic
- Prisma schema: `prisma/schema.prisma`
- Type definitions: `app/routes/app/memorization/types.ts`
- Auth service: `app/services/auth/auth.server.ts`

---

**Need help?** Check console logs, Prisma Studio, and browser DevTools! 🚀
