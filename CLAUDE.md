# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Simakin** is a gamified Al-Quran memorization platform that uses AI-powered recitation analysis to help users memorize and improve their Quran recitation. Built with React Router v7 (SSR), Prisma ORM, MySQL, and Google Gemini AI.

## Tech Stack

- **Framework**: React Router v7 with Server-Side Rendering
- **Database**: MySQL + Prisma ORM
- **UI**: TailwindCSS v4 + shadcn/ui components
- **AI**: Google Gemini 2.0 Flash (transcription + validation)
- **Auth**: Google OAuth + Email/Password (bcryptjs)
- **APIs**: AlQuran Cloud API, Equran API
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:5173)
pnpm typecheck              # Run TypeScript type checking
pnpm build                  # Production build
pnpm start                  # Start production server

# Database
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Create & apply migration
npx prisma migrate deploy   # Apply migrations (production)
npx prisma studio           # Open database GUI
npx prisma db seed          # Run seed script

# Utilities
pnpm lint                   # Run ESLint (if configured)
pnpm format                 # Format with Prettier (if configured)
```

## Critical Architecture Patterns

### 1. React Router v7 Route Structure

Routes use file-based routing with type-safe loaders and actions:

```typescript
// Example: app/routes/app/example/index.tsx
import type { Route } from "./+types/index";

// Server-side data fetching
export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request); // Auth check
  const data = await db.model.findMany({ where: { userId } });
  return { data };
}

// Form submission handler
export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  // Process and validate
  const field = formData.get('field') as string;
  if (!field) {
    return json({ success: false, error: 'Required' }, { status: 400 });
  }

  // Database operation
  await db.model.create({ data: { userId, field } });

  return redirect('/success');
}

// React component
export default function Example() {
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <div>...</div>;
}
```

**Type Safety Rules**:
- Always use `Route.LoaderArgs` and `Route.ActionArgs` from `./+types/index`
- Type loaderData: `useLoaderData<typeof loader>()`
- Type actionData: `useActionData<typeof action>()`

### 2. Authentication Pattern

All protected routes MUST use `requireUserId()`:

```typescript
import { requireUserId } from "~/services/auth/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  // Throws redirect to signin if not authenticated
  // Otherwise returns userId string
}
```

**Auth Service Location**: `app/services/auth/auth.server.ts`

### 3. Service Layer Architecture

Business logic lives in `app/services/`, NOT in route files:

```
app/services/
├── auth/auth.server.ts              # Authentication logic
├── memorization/memorization.server.ts  # Memorization CRUD
├── exp/exp.server.ts                # EXP calculation formulas
└── streak/streak.server.ts          # Streak tracking (timezone-aware)
```

**Pattern**: Routes call service functions, services interact with database.

### 4. Database Access Pattern

```typescript
import { db } from "~/lib/db.server";

// Always use Prisma client from this import
const user = await db.user.findUnique({
  where: { id: userId },
  include: { profile: true, memorization: true }
});

// Use transactions for related operations
await db.$transaction([
  db.recitation.create({ data: {...} }),
  db.user.update({ where: { id: userId }, data: { totalSessions: { increment: 1 } } })
]);
```

**Database Client**: `app/lib/db.server.ts`

## Recitation Flow Architecture (CRITICAL)

This is the core feature - understand this flow completely before making changes.

### Flow Overview

```
User Creates Session → Records Audio → Gemini Transcribes → Gemini Validates →
  → Database Storage → EXP Calculation → Streak Update → Results Display
```

### Phase 1: Session Creation

**Route**: `/app/memorization/new`

**Files**:
- `app/routes/app/memorization/new/index.tsx` (loader/action)
- `app/routes/app/memorization/new/new-memorization-form.tsx` (UI)

User selects:
- Surah (from Equran API dropdown)
- Ayah range (start → end)
- Type: ZIYADAH (new memorization) or MUROJAAH (review)

Validation via Zod schema at `app/routes/app/memorization/utils/schema.ts`

### Phase 2: Audio Recording

**Route**: `/app/memorization/session?surah={n}&start={n}&end={n}&type={type}`

**Files**:
- `app/routes/app/memorization/session/index.tsx` (loader/action - CORE PROCESSING)
- `app/routes/app/memorization/session/memorization-session.tsx` (UI component)
- `app/routes/app/memorization/session/prompts.ts` (Gemini prompts)

**Audio Capture**:
- Uses Web Audio API (`navigator.mediaDevices.getUserMedia()`)
- Records as `audio/webm` Blob
- Converts to base64 for Gemini API
- User can preview and re-record before submission

### Phase 3: AI Processing (2-Step)

**File**: `app/lib/gemini/gemini.ts`

#### Step 1: Transcription
**Model**: `gemini-2.0-flash` via `modelTranscribeQuran.transcribe()`

**Purpose**: Convert audio to exact Arabic text (including mistakes)

**Critical Instruction**: Do NOT autocorrect to official Quran text. Transcribe what is actually pronounced, even if wrong.

**Input**:
```typescript
[
  { text: transcribePrompt() },  // Instructions
  { inlineData: { data: audioBase64, mimeType: "audio/webm" } }
]
```

**Output**:
```json
{ "result": "ٱلْـحِمْدُ لِلّٰهِ رِبِّ ٱلْعَـٰلِمِينَ" }
```

#### Step 2: Validation
**Model**: `gemini-2.0-flash` via `modelMemorizeValidation()`

**Purpose**: Evaluate accuracy, tajweed, fluency

**Input**:
- Surah name + ayah range
- Ground truth (official Quran text from Equran API)
- User's transcription (from Step 1)
- Audio file (for verification)

**Output Structure**:
```json
{
  "transcription": "User's recitation",
  "kesalahan_hafalan": [
    {"ayah": 2, "type": "lafal salah", "detail": "..."}
  ],
  "kesalahan_tajwid": [
    {"ayah": 2, "type": "mad thabi'i terlalu pendek", "letter": "لا", "suggestion": "..."}
  ],
  "kesalahan_waqaf": [
    {"ayah": 2, "type": "waqaf tidak sesuai mushaf", "detail": "..."}
  ],
  "saran_umum": "General advice",
  "accuracy_score": 85.5,    // 0-100
  "tajweed_score": 78.0,     // 0-100
  "fluency_score": 90.0,     // 0-100
  "metadata_quran": { ... }
}
```

**Tajweed Categories Evaluated**:
1. Nun Sukun & Tanwin (Idzhar, Idgham, Iqlab, Ikhfa')
2. Mim Sukun (Ikhfa' Syafawi, Idgham Mimi, Idzhar Syafawi)
3. Lam Al-Ta'rif (Idgham Syamsiyah, Idzhar Qamariyah)
4. Madd/Prolongation (Thabi'i, Wajib Muttashil, Jaiz Munfashil, Aridh Lissukun, Lazim)
5. Ghunnah (nasal sounds)
6. Qalqalah (echo pronunciation)
7. Tafkhim vs Tarqiq (heavy vs light)

### Phase 4: Database & Gamification

**Location**: `app/routes/app/memorization/session/index.tsx` (action handler, lines 256-321)

**Operations** (in order):
1. Create `Recitation` record with status COMPLETED
2. Create related `Feedback` record with scores and error arrays
3. Update user streak (timezone-aware) via `updateUserStreak(userId)`
4. Calculate EXP via `calculateExp()` formula
5. Update user stats: `totalSessions`, `totalScore`
6. Create/update `UserMemorization` record if ZIYADAH type

**Files**:
- `app/services/exp/exp.server.ts` - EXP calculation
- `app/services/streak/streak.server.ts` - Streak management

### Phase 5: Results Display

**Route**: `/app/memorization/result/{recitationId}`

**Files**:
- `app/routes/app/memorization/result/[id]/index.tsx` (loader)
- `app/routes/app/memorization/result/[id]/memorization-result.tsx` (UI)

Displays:
- Three scores with color coding (green: 90+, yellow: 75-89, red: <75)
- Expandable error sections (memorization, tajweed, waqaf)
- Transcription with "read more" dialog
- General advice
- Session metadata (surah, ayah, date, duration)

## EXP System Formula

**File**: `app/services/exp/exp.server.ts`

```typescript
EXP = baseScore × 5 × streakMultiplier × modeMultiplier × lengthMultiplier
```

**Base Score**: `(accuracy + tajweed + fluency) / 3`

**Multipliers**:
- **Streak**: 1.0x (0-2 days), 1.25x (3-6), 1.5x (7-13), 2.0x (14+)
- **Mode**: ZIYADAH 1.3x, MUROJAAH 1.0x
- **Length**: 1.0x (1-4 ayat), 1.1x (5-9), 1.2x (10-19), 1.5x (20+)

**Example**: Base 85 → 85×5 = 425 → ×1.5 (streak) → ×1.3 (ziyadah) → ×1.2 (10 ayat) = 994 EXP

## Streak System

**File**: `app/services/streak/streak.server.ts`

**Timezone-Aware Logic**:
- Uses user's timezone from `UserProfile.timezone` (default: "Asia/Jakarta")
- Compares dates in user's local timezone, NOT server timezone
- Increments only once per day (per user's timezone)

**Rules**:
- Same day (0 days diff): No increment
- Consecutive day (1 day diff): Increment by 1
- Gap > 1 day: Reset to 1

**Function**: `updateUserStreak(userId: string): Promise<number>`

## Onboarding System

**Route**: `/app/onboarding`

**Purpose**: First-time user setup (runs once)

**Mandatory Fields**:
- Referral source (13 options + OTHER with custom text)

**Optional Fields**:
- Page ranges (e.g., "1-201, 542-604")

**Page Range Parsing**:
- **NEVER use Gemini AI** - use AlQuran Cloud API instead
- **Function**: `parsePageRanges()` in `app/lib/quran-page-mapping.ts`
- Makes 2-3 API calls to convert pages to exact surah/ayah ranges
- 100% accurate vs ~60% with AI

**Important**: Auto-redirect if user already completed onboarding (check `UserProfile.referralSource`)

## Database Schema Key Models

### User
```prisma
model User {
  id               String
  email            String @unique
  username         String @unique
  passwordHash     String?

  // Aggregated stats
  totalSessions    Int       @default(0)
  totalScore       Float     @default(0)
  streakDays       Int       @default(0)
  lastActivityDate DateTime?

  profile          UserProfile?
  recitations      Recitation[]
  memorization     UserMemorization[]
}
```

### UserProfile
```prisma
model UserProfile {
  userId         String @unique
  timezone       String @default("Asia/Jakarta")  // Critical for streak!
  referralSource ReferralSource?  // Onboarding data
  referralOther  String?
}
```

### Recitation (Session Record)
```prisma
model Recitation {
  id             String
  userId         String
  surah          Int
  startAyah      Int
  endAyah        Int
  mode           RecitationMode  // ZIYADAH | MUROJAAH
  status         RecitationStatus
  duration       Int?            // seconds

  feedback       Feedback?       // One-to-one relation
  memorizationId String?         // Links to UserMemorization
}
```

### Feedback (AI Evaluation Results)
```prisma
model Feedback {
  id               String
  recitationId     String @unique
  transcription    String?  @db.Text
  memorizationErrs Json?    // Array of errors
  tajweedErrs      Json?    // Array of errors
  waqfErrs         Json?    // Array of errors
  generalAdvice    String?  @db.Text
  accuracyScore    Float    // 0-100
  tajweedScore     Float    // 0-100
  fluencyScore     Float    // 0-100
  metadataQuran    Json?
}
```

### UserMemorization (Progress Tracking)
```prisma
model UserMemorization {
  id          String
  userId      String
  surah       Int  // 1-114
  startAyah   Int
  endAyah     Int
  status      MemorizationStatus  // PLANNED | IN_PROGRESS | COMPLETED
  source      MemorizationSource  // SIMAKIN | ONBOARDING | MANUAL
  completedAt DateTime?

  recitations Recitation[]  // All ziyadah sessions for this range

  @@unique([userId, surah, startAyah, endAyah])
}
```

## External API Integrations

### Equran API (Primary Quran Data)
```typescript
// Get all surahs metadata
GET https://equran.id/api/v2/surat

// Get specific surah with ayahs
GET https://equran.id/api/v2/surat/{surahNumber}
// Response: { nama, nama_latin, jumlah_ayat, ayat: [...] }
```

**Usage**: Fetching ground truth for validation, surah dropdowns

### AlQuran Cloud API (Page Mapping)
```typescript
// Get page data
GET https://api.alquran.cloud/v1/page/{pageNumber}/quran-uthmani

// Get all surahs metadata
GET https://api.alquran.cloud/v1/surah
```

**Usage**: Onboarding page range parsing ONLY

**File**: `app/lib/quran-page-mapping.ts`

## File Naming Conventions

- **Routes**: kebab-case (e.g., `memorization-session.tsx`)
- **Components**: kebab-case (e.g., `app-sidebar.tsx`)
- **Services**: kebab-case with `.server.ts` suffix (e.g., `auth.server.ts`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-mobile.ts`)
- **Types**: kebab-case with `.types.ts` suffix (e.g., `user.types.ts`)

**Component Functions**: PascalCase inside kebab-case files
```typescript
// File: app/components/user-profile.tsx
export function UserProfile() { ... }
```

## Import Organization Order

```typescript
// 1. React and React Router
import { useState, useEffect } from "react";
import { useLoaderData, Form } from "react-router";

// 2. External libraries
import clsx from "clsx";
import { z } from "zod";

// 3. Internal utilities (~ alias = app/)
import { db } from "~/lib/db.server";
import { requireUserId } from "~/services/auth/auth.server";

// 4. Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

// 5. Types
import type { User } from "~/types/user.types";
```

## Error Handling Pattern

```typescript
try {
  // Operation
  const result = await someOperation();
  return json({ success: true, data: result });
} catch (error) {
  console.error("[SERVICE] Error message:", error);
  return json(
    { success: false, error: "User-friendly message" },
    { status: 500 }
  );
}
```

**Logging Convention**: Use service prefix tags like `[AUTH]`, `[RECITATION]`, `[EXP]`, `[STREAK]`

## Validation Pattern

**Client-Side** (in components):
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (field: string, value: string) => {
  const newErrors = { ...errors };
  if (!value) {
    newErrors[field] = 'Field required';
  } else {
    delete newErrors[field];
  }
  setErrors(newErrors);
};

// Disable submit if errors exist
<Button disabled={Object.keys(errors).length > 0}>Submit</Button>
```

**Server-Side** (in action handlers):
```typescript
if (!field) {
  return json({ success: false, error: "Field required" }, { status: 400 });
}
```

**Zod Schemas**: Located in `app/routes/app/memorization/utils/schema.ts` and similar paths

## UI Component Usage

**shadcn/ui Components**: Located in `app/components/ui/`

```typescript
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
```

**TailwindCSS**: Use utility-first approach
- Responsive: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode: `dark:` prefix
- Custom colors: Define in Tailwind config if needed

## Critical Don'ts

❌ **NEVER**:
- Use Gemini AI for page range parsing (use AlQuran Cloud API via `parsePageRanges()`)
- Skip server-side validation (always validate in action handlers)
- Use `any` type in TypeScript (use proper types)
- Put database queries directly in components (use loaders/actions)
- Forget to call `requireUserId()` in protected routes
- Ignore timezone for streak calculations (always use user's timezone)
- Modify Gemini system instructions without understanding the full flow
- Mix multiple surahs in a single UserMemorization record
- Create duplicate UserMemorization records (unique constraint exists)

## Critical Do's

✅ **ALWAYS**:
- Use `requireUserId()` for authentication checks
- Validate inputs on both client and server
- Use proper TypeScript types (no `any`)
- Keep business logic in service layer (`app/services/`)
- Use `.server.ts` suffix for server-only code
- Handle loading states and errors in UI
- Use timezone from UserProfile for streak calculations
- Call AlQuran Cloud API for page parsing (NOT Gemini)
- Check for memorization overlaps before creating ZIYADAH sessions
- Parse and clean JSON responses from Gemini (remove markdown code fences)

## Common Workflows

### Adding a New Protected Route

1. Create route file: `app/routes/app/feature/index.tsx`
2. Import and call `requireUserId()` in loader:
   ```typescript
   export async function loader({ request }: Route.LoaderArgs) {
     const userId = await requireUserId(request);
     // Fetch data...
   }
   ```
3. Add navigation link in `app/components/app-sidebar.tsx` if needed

### Adding a Database Model

1. Update `prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name descriptive_name`
3. This auto-generates Prisma client
4. Create service functions in `app/services/model-name/model-name.server.ts`
5. Import `db` from `~/lib/db.server` in service file

### Modifying Gemini Prompts

1. **File**: `app/lib/gemini/gemini.ts`
2. Understand current 2-step flow (transcribe → validate)
3. Test changes thoroughly with real audio samples
4. Never remove critical instructions (e.g., "don't autocorrect")
5. Ensure JSON output format stays consistent (field names matter!)
6. Consider updating types in `app/routes/app/memorization/types.ts` if structure changes

## Testing Recitation Flow Locally

1. Start dev server: `pnpm dev`
2. Create account or sign in
3. Complete onboarding if first time
4. Navigate to `/app/memorization/new`
5. Select Surah 1 (Al-Fatihah), ayah 1-7, type ZIYADAH
6. Grant microphone permission
7. Record recitation (try both correct and intentionally wrong recitations)
8. Submit and observe:
   - Console logs for Gemini API calls
   - Database records in Prisma Studio
   - Results page display
   - EXP calculation and streak update

**Environment Variables Required**:
- `GEMINI_API_KEY` - Google AI API key
- `DATABASE_URL` - MySQL connection string

## Project Documentation Reference

Additional detailed docs in `docs/` folder:
- `AI_SYSTEM_INSTRUCTIONS.md` - Comprehensive project overview
- `QURAN_API_INTEGRATION.md` - API integration details
- `QURAN_PAGE_MAPPING.md` - Page mapping system
- `ONBOARDING_SYSTEM.md` - Onboarding flow details
- `MEMORIZATION_TRACKING.md` - Memorization system
- `EXP_SYSTEM.md` - Gamification formulas
- `STREAK_IMPLEMENTATION.md` - Streak tracking logic

## Branch Information

**Current Branch**: `feature/recitation-flow`

**Recent Changes**:
- Complete Gemini integration for recitation flow
- Two-step AI processing (transcription + validation)
- Comprehensive tajweed evaluation system
- Three-dimensional scoring (accuracy, tajweed, fluency)
- Full error categorization with Indonesian feedback
- EXP calculation with 4-factor multipliers
- Timezone-aware streak tracking

**Main Branch**: `main`

When ready to merge, ensure:
- All TypeScript errors resolved (`pnpm typecheck`)
- Gemini API responses are properly cleaned (remove markdown fences)
- Database migrations are included
- `.env.example` is updated with required variables
