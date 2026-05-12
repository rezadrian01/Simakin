# Simakin - Technical Specification Document

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Feature Specifications](#5-feature-specifications)
6. [API Integrations](#6-api-integrations)
7. [Security & Authentication](#7-security--authentication)
8. [Monetization System](#8-monetization-system)
9. [User Flows](#9-user-flows)
10. [Future Enhancements](#10-future-enhancements)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. Project Overview

### 1.1 Product Description

**Simakin** (from Arabic: سَمَكَ to memorize) is a gamified Al-Quran memorization platform that uses AI-powered recitation analysis to help users memorize and improve their Quran recitation. The platform combines traditional memorization methods with modern AI technology to provide real-time feedback on tajweed (pronunciation rules), accuracy, and fluency.

### 1.2 Target Audience

| Segment | Description |
|---------|-------------|
| Primary | Indonesian Muslims looking to memorize or improve Quran recitation |
| Age Range | 10-60 years old |
| Skill Level | Beginner to advanced hafiz |
| Language | Indonesian (primary), English (future) |

### 1.3 Core Value Proposition

- **AI-Powered Feedback**: Real-time analysis of recitation using Google Gemini
- **Gamification**: EXP system, streaks, leaderboards to maintain engagement
- **Progress Tracking**: Visual charts and statistics to monitor improvement
- **Accessibility**: Available on web (PWA-ready for mobile)

### 1.4 Business Model

- **Freemium**: Free tier with limited tokens, paid token packages
- **Token System**: Each recitation session costs tokens
- **Payment Gateway**: Midtrans integration for token purchases
- **No Subscription**: Pay-as-you-go model (subscription in future)

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| React Router | v7 | Routing (SSR) |
| TypeScript | 5.x | Type safety |
| TailwindCSS | v4 | Styling |
| shadcn/ui | latest | Component library |
| Lucide React | latest | Icons |
| Recharts | latest | Data visualization |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| React Router | v7 | Full-stack framework |
| Prisma | 6.x | ORM |
| MySQL | 8.x | Database |

### 2.3 External Services

| Service | Purpose |
|---------|---------|
| Google Gemini 2.0 Flash | AI transcription & validation |
| Google Cloud Storage | Audio file storage |
| Equran API | Quran data (surahs, ayahs) |
| AlQuran Cloud API | Page-to-ayah mapping |
| Midtrans | Payment gateway |

### 2.4 Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## 3. System Architecture

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  React   │  │  Router  │  │  Tailwind│  │ shadcn/ui│        │
│  │   App    │  │   v7     │  │   v4     │  │         │        │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘        │
└───────┼────────────┼───────────────────────────────────────────┘
        │            │
        │    Request/Response
        │            │
┌───────┴────────────┴───────────────────────────────────────────┐
│                        SERVER (Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Loaders    │  │   Actions    │  │  Middleware │          │
│  │  (GET/POST)  │  │  (Mutations) │  │  (Auth/etc) │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                │                   │                   │
│  ┌──────┴────────────────┴───────────────────┴───────────────┐ │
│  │                     SERVICE LAYER                          │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│  │  │   Auth   │ │   Exp    │ │  Streak  │ │  Token   │    │ │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │    │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                       EXTERNAL SERVICES                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │   Gemini   │  │    GCS    │  │  Midtrans  │  │  Equran   │  │
│  │    API     │  │           │  │            │  │   APIs    │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                      DATABASE (MySQL)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Users │ Profiles │ Recitations │ Feedback │ Memorization │  │
│  │  Tokens │ Transactions │ Leaderboards │ Achievements    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

```
User Action → Route Loader/Action → Service Layer → Database
                                         ↓
                                  External APIs
                                  (Gemini, Midtrans)
```

### 3.3 Module Structure

```
app/
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities
│   ├── db.server.ts     # Prisma client
│   ├── gemini/          # AI integration
│   ├── gcs.server.ts    # Cloud storage
│   └── quran-page-mapping.ts
├── routes/              # React Router routes
│   ├── auth/           # Authentication
│   ├── app/            # Protected app routes
│   └── home.tsx        # Landing page
└── services/           # Business logic
    ├── auth/           # Auth service
    ├── exp/            # EXP calculation
    ├── streak/         # Streak tracking
    ├── token/          # Token management
    └── memorization/   # Memorization CRUD
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │UserProfile  │       │  UserToken  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ userId (FK) │       │ userId (FK) │
│ email       │──┐    │ timezone    │       │ balance     │
│ username    │  │    │ theme       │       │ totalEarned │
│ passwordHash│  └────│ referralSrc │       │ totalSpent  │
│ role        │       └─────────────┘       └─────────────┘
│ streakDays  │              │                     │
│ totalScore │              │                     │
└──────┬──────┘              │                     │
       │                     │                     │
       │ 1:N                 │                     │
       ▼                     │                     │
┌─────────────┐              │                     │
│  Recitation │              │                     │
├─────────────┤              │                     │
│ id          │              │                     │
│ userId (FK) │──────────────┘                     │
│ surah       │                                    │
│ startAyah   │                                    │
│ endAyah     │                                    │
│ mode        │                                    │
│ status      │                                    │
│ duration    │         ┌─────────────────────┐     │
│ audioUrl    │         │   Transaction      │     │
└──────┬──────┘         ├─────────────────────┤     │
       │                │ id                  │     │
       │ 1:1            │ userId (FK)         │─────┘
       ▼                │ amount              │
┌─────────────┐         │ type (PURCHASE/GIFT)│
│  Feedback   │         │ paymentMethod      │
├─────────────┤         │ paymentStatus      │
│ recitationId│         │ midtransOrderId    │
│ transcription│        │ createdAt          │
│ accuracyScore│        └─────────────────────┘
│ tajweedScore│
│ fluencyScore│
└─────────────┘

┌──────────────────┐       ┌──────────────────┐
│ UserMemorization│       │   Leaderboard   │
├──────────────────┤       ├──────────────────┤
│ userId (FK)      │       │ userId (FK)      │
│ surah            │       │ period           │
│ startAyah        │       │ score (EXP)      │
│ endAyah          │       │ rank             │
│ status           │       │ category         │
│ source           │       └──────────────────┘
│ completedAt      │
└──────────────────┘       ┌──────────────────┐
                          │   Achievement    │
                          ├──────────────────┤
                          │ key              │
                          │ title            │
                          │ description      │
                          └──────────────────┘
```

### 4.2 Complete Schema

#### Enums

```prisma
enum Role {
  USER
  ADMIN
}

enum RecitationMode {
  MUROJAAH   // Review/recite previously memorized
  ZIYADAH    // New memorization
}

enum RecitationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum MemorizationStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
}

enum MemorizationSource {
  SIMAKIN      // Created through recitation
  ONBOARDING   // From onboarding page input
  MANUAL       // Manually added
}

enum ReferralSource {
  INSTAGRAM
  TIKTOK
  YOUTUBE
  FACEBOOK
  TWITTER
  WEBSITE
  GOOGLE_SEARCH
  FRIEND
  FAMILY
  TEACHER
  MOSQUE
  SCHOOL
  OTHER
}

enum TransactionType {
  PURCHASE    // Token purchase
  EARNED      // Bonus/gift tokens
  REFUND      // Refunded tokens
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  EXPIRED
  CANCELLED
}
```

#### User Models

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  fullName     String?
  passwordHash String?
  avatarUrl    String?
  role         Role     @default(USER)

  // Stats
  totalSessions Int     @default(0)
  totalScore    Float   @default(0)
  streakDays    Int     @default(0)
  lastActivityDate DateTime?

  // Relations
  profile          UserProfile?
  recitations      Recitation[]
  userAchievements UserAchievement[]
  memorization     UserMemorization[]
  leaderboards     Leaderboard[]
  token            UserToken?
  transactions     Transaction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model UserProfile {
  id              String           @id @default(cuid())
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String           @unique
  preferredLang   String           @default("id")
  theme           String           @default("light")
  timezone        String           @default("Asia/Jakarta")
  bio             String?
  referralSource  ReferralSource?
  referralOther   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UserToken {
  id           String @id @default(cuid())
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String @unique
  balance      Int    @default(0)      // Current token balance
  totalEarned  Int    @default(0)      // Total tokens earned
  totalSpent   Int    @default(0)      // Total tokens spent
  totalTopup   Int    @default(0)      // Total tokens purchased

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Recitation Models

```prisma
model Recitation {
  id             String           @id @default(cuid())
  user           User             @relation("user_recitations", fields: [userId], references: [id])
  userId         String
  surah          Int              // 1-114
  startAyah      Int
  endAyah        Int
  mode           RecitationMode
  status         RecitationStatus @default(PENDING)
  duration       Int?             // seconds
  audioUrl       String?          // GCS URL

  // Token tracking
  tokenCost      Int              @default(10)  // Tokens spent

  feedback       Feedback?
  memorizationId String?
  memorization   UserMemorization? @relation(fields: [memorizationId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([userId, mode])
  @@index([createdAt])
}

model Feedback {
  id               String     @id @default(cuid())
  recitationId     String     @unique
  recitation       Recitation @relation(fields: [recitationId], references: [id])
  transcription    String?    @db.Text

  // Error arrays (JSON)
  memorizationErrs Json?
  tajweedErrs      Json?
  waqfErrs         Json?

  generalAdvice    String?    @db.Text

  // Scores (0-100)
  accuracyScore    Float
  tajweedScore     Float
  fluencyScore     Float

  metadataQuran    Json?

  createdAt        DateTime   @default(now())
}

model UserMemorization {
  id            String              @id @default(cuid())
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  surah         Int                 // 1-114
  startAyah     Int
  endAyah       Int

  status        MemorizationStatus  @default(COMPLETED)
  source        MemorizationSource   @default(SIMAKIN)
  completedAt   DateTime?

  recitations   Recitation[]

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@unique([userId, surah, startAyah, endAyah])
  @@index([userId, status])
  @@index([userId, surah])
  @@index([userId, source])
}
```

#### Transaction Models

```prisma
model Transaction {
  id              String        @id @default(cuid())
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String

  // Transaction details
  amount          Int           // Number of tokens
  type            TransactionType
  paymentMethod   String?       // e.g., "bank_transfer", "gopay"
  paymentStatus   PaymentStatus @default(PENDING)

  // Midtrans integration
  midtransOrderId String?       // Midtrans order ID
  midtransToken   String?       // Midtrans transaction token
  midtransUrl     String?       // Payment page URL

  // Metadata
  packageName     String?       // e.g., "Starter", "Basic", "Pro", "Premium"
  pricePaid       Int?          // Price in IDR

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([midtransOrderId])
  @@index([paymentStatus])
}
```

#### Gamification Models

```prisma
model Leaderboard {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  period    String   // "2025-10-06", "2025-W40", "global"
  score     Float    // Total EXP
  rank      Int?
  category  String?  // "weekly", "monthly", "overall"
  createdAt DateTime @default(now())

  @@unique([userId, period, category])
  @@index([period, score])
  @@index([userId, period])
}

model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique // e.g., "streak_7", "first_100_ayats"
  title       String
  description String?
  iconUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String     @id @default(cuid())
  userId        String
  achievementId String

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  awardedAt DateTime @default(now())

  @@unique([userId, achievementId])
  @@index([userId])
}
```

---

## 5. Feature Specifications

### 5.1 Authentication System

#### Features
- Email/Password registration and login
- Google OAuth 2.0 integration
- Session-based authentication (cookie)
- Protected routes with auto-redirect

#### User Flows
1. **Signup**: Email + password → Create user → Create profile → Create token record
2. **Signin**: Validate credentials → Create session → Redirect to dashboard
3. **Google OAuth**: Redirect to Google → Callback → Create/update user → Create session

#### Middleware
- `requireUserId(request)` - Throws redirect if not authenticated
- `getUserId(request)` - Returns userId or null

### 5.2 Onboarding System

#### Purpose
First-time user setup (runs once per user)

#### Flow
1. Check if user completed onboarding (via `UserProfile.referralSource`)
2. If not, redirect to `/app/onboarding`
3. User enters:
   - **Required**: Referral source (13 options + OTHER)
   - **Optional**: Page ranges (e.g., "1-201, 542-604")

#### Page Range Parsing
- Uses AlQuran Cloud API (NOT Gemini)
- Fetches page data to map pages → surah/ayah
- Creates `UserMemorization` records with source: ONBOARDING

### 5.3 Recitation System (Core Feature)

#### Phase 1: Session Creation

**Route**: `/app/recitation/new`

**Input**:
- Surah selection (from Equran API)
- Ayah range (start → end)
- Mode: ZIYADAH or MUROJAAH

**Validation**:
- Zod schema validation
- Start ayah ≤ End ayah
- Check token balance (must have ≥10 tokens)
- Check for overlapping memorization (ZIYADAH only)

#### Phase 2: Audio Recording

**Route**: `/app/recitation/session?surah={n}&start={n}&end={n}&type={type}`

**Features**:
- Web Audio API for recording
- Records as `audio/webm` format
- Base64 encoding for API transfer
- Preview and re-record functionality
- Max duration: 10 minutes (600 seconds)

#### Phase 3: AI Processing (Gemini 2.0 Flash)

**Step 1: Transcription**
- Model: `gemini-2.0-flash`
- Input: Audio file + system prompt
- Output: Arabic text with harakat
- **Critical**: Does NOT autocorrect - transcribes exactly as pronounced

**Step 2: Validation**
- Model: `gemini-2.0-flash`
- Input: Audio + transcription + ground truth (from Equran API)
- Evaluates:
  - **Accuracy**: Word-for-word correctness
  - **Tajweed**: Pronunciation rules (7 categories)
  - **Waqaf**: Pausing patterns
  - **Fluency**: Smoothness and pace

**Output Structure**:
```json
{
  "transcription": "User's recitation",
  "kesalahan_hafalan": [
    {"ayah": 2, "type": "lafal salah", "detail": "..."}
  ],
  "kesalahan_tajwid": [
    {"ayah": 2, "type": "mad thabi'i", "letter": "...", "suggestion": "..."}
  ],
  "kesalahan_waqaf": [
    {"ayah": 2, "type": "waqaf tidak sesuai mushaf", "detail": "..."}
  ],
  "saran_umum": "...",
  "accuracy_score": 85.5,
  "tajweed_score": 78.0,
  "fluency_score": 90.0,
  "metadata_quran": {"surah": "Al-Baqarah", "ayat_dari": 1, "ayat_sampai": 5}
}
```

#### Phase 4: Database & Gamification

**Token Deduction**:
- Deduct 10 tokens from `UserToken.balance`
- Increment `UserToken.totalSpent`
- Record in transaction log (if paid token)

**Database Operations** (in transaction):
1. Upload audio to GCS
2. Create `Recitation` record with status COMPLETED
3. Create `Feedback` record
4. Create/update `UserMemorization` (ZIYADAH only)
5. Update streak via `updateUserStreak()`
6. Calculate EXP via `calculateExp()`
7. Update user stats: `totalSessions`, `totalScore`

#### Phase 5: Results Display

**Route**: `/app/recitation/result/{recitationId}`

**Display**:
- Three scores with color coding:
  - 🟢 Green: 90+
  - 🟡 Yellow: 75-89
  - 🔴 Red: <75
- Expandable error sections
- Transcription with "read more" dialog
- General advice
- Session metadata (surah, ayah, date, duration)

### 5.4 EXP System

**Formula**:
```
EXP = baseScore × 5 × streakMultiplier × modeMultiplier × lengthMultiplier
```

**Components**:
- **Base Score**: `(accuracy + tajweed + fluency) / 3`
- **Base Multiplier**: 5

**Multipliers**:
| Streak | Multiplier |
|--------|-------------|
| 0-2 days | 1.0x |
| 3-6 days | 1.25x |
| 7-13 days | 1.5x |
| 14+ days | 2.0x |

| Mode | Multiplier |
|------|------------|
| ZIYADAH | 1.3x |
| MUROJAAH | 1.0x |

| Ayah Count | Multiplier |
|------------|------------|
| 1-4 | 1.0x |
| 5-9 | 1.1x |
| 10-19 | 1.2x |
| 20+ | 1.5x |

**Example**:
- Base score: 85
- Streak: 7 days (1.5x)
- Mode: ZIYADAH (1.3x)
- Ayah: 10 (1.2x)
- **Total EXP**: 85 × 5 × 1.5 × 1.3 × 1.2 = **994 EXP**

### 5.5 Streak System

**Timezone-Aware**:
- Uses `UserProfile.timezone` (default: "Asia/Jakarta")
- Compares dates in user's local timezone

**Rules**:
- Same day: No increment (just update timestamp)
- Consecutive day (1 day diff): Increment by 1
- Gap > 1 day: Reset to 1

### 5.6 Dashboard

**Route**: `/app/dashboard`

**Components**:
- Stats overview (total sessions, total score, streak, exp)
- Today's progress
- Recent sessions list
- Quick action buttons

### 5.7 Progress Report

**Route**: `/app/progress-report`

**Features**:
- Daily/Weekly/Monthly EXP charts
- Recitation frequency trends
- Accuracy/Tajweed/Fluency improvement over time
- Memorization progress by surah

### 5.8 Leaderboard

**Route**: `/app/leaderboard`

**Categories**:
- Weekly
- Monthly
- Overall (all-time)

**Features**:
- Ranked list by EXP
- Top 3 highlighted
- User's own rank displayed

### 5.9 Minigame (Future)

**Name**: "Guess the Ayah"

**Concept**:
- Display random ayah (without surah/ayah number)
- User guesses which surah it belongs to
- Earn EXP for correct answers

**Status**: Not yet implemented

### 5.10 Settings Page (Future)

**Route**: `/app/settings`

**Features**:
- Language selection (future)
- Theme toggle (light/dark)
- Timezone configuration
- Account management
- Reset progress (with confirmation)

---

## 6. API Integrations

### 6.1 Equran API (Primary)

**Base URL**: `https://equran.id/api/v2`

**Endpoints**:

| Endpoint | Purpose |
|----------|---------|
| `/surat` | Get all surahs metadata |
| `/surat/{nomor}` | Get specific surah with ayahs |

**Usage**: Surah dropdowns, ground truth for validation

### 6.2 AlQuran Cloud API

**Base URL**: `https://api.alquran.cloud/v1`

**Endpoints**:

| Endpoint | Purpose |
|----------|---------|
| `/page/{pageNumber}/quran-uthmani` | Get page data |
| `/surah` | Get all surahs metadata |

**Usage**: Page range parsing in onboarding ONLY

### 6.3 Google Gemini API

**Model**: `gemini-2.0-flash`

**Functions**:
1. `modelTranscribeQuran()` - Audio to text
2. `modelMemorizeValidation()` - Recitation analysis
3. `modelParsePageRanges()` - Onboarding page parsing

**Error Handling**:
- 503 (overload) - Retry with backoff
- 429 (rate limit) - Queue and retry
- 400/401/500 - User-friendly error message

### 6.4 Google Cloud Storage

**Bucket Structure**:
```
gs://simakin-audio/
└── users/
    └── {userId}/
        └── recitations/
            └── {recitationId}.webm
```

**Access**: Private, signed URLs with 60-minute expiry

### 6.5 Midtrans (Payment Gateway)

**Base URL**: `https://app.midtrans.com/snap/v1`

**Integration**:
- Snap API (hosted payment page)
- Transaction status webhook
- Support for: Bank Transfer, E-Wallet (GoPay, OVO, etc.)

**Flow**:
1. User selects token package
2. Backend creates transaction in DB
3. Backend requests Midtrans token
4. User redirected to payment page
5. On success → Webhook updates transaction status
6. Tokens added to user balance

---

## 7. Security & Authentication

### 7.1 Authentication

| Aspect | Implementation |
|--------|---------------|
| Session | Cookie-based (httpOnly, secure) |
| Password | bcryptjs hashing |
| OAuth | Google OAuth 2.0 |
| CSRF | React Router handles |

### 7.2 Authorization

| Role | Access |
|------|--------|
| USER | Own data, recitation, dashboard |
| ADMIN | All user data, analytics |

### 7.3 Data Protection

- Audio files: Private GCS (signed URLs)
- Personal data: Encrypted at rest (future)
- API keys: Environment variables only

---

## 8. Monetization System

*See separate document: `MONETIZATION_PLAN.md` for complete details.*

### 8.1 Token System Summary

| Aspect | Value |
|--------|-------|
| Free tier | 35 tokens on signup (3-4 free sessions) |
| Cost per session | 10 tokens (fixed) |
| Token expiry | Never (permanent) |
| Top-up method | Midtrans payment gateway |

### 8.2 Token Packages

| Package | Tokens | Price (IDR) | Sessions |
|---------|--------|-------------|----------|
| Starter | 10 | Rp 15,000 | 1 |
| Basic | 50 | Rp 60,000 | 5 |
| Pro | 100 | Rp 100,000 | 10 |
| Premium | 500 | Rp 400,000 | 50 |

### 8.3 Revenue Share

- Approximate cost per session: ~$0.02-0.03 (~$300-500 IDR)
- Selling price per 10 tokens: Rp 15,000
- **Margin**: ~30-50x (still profitable)

---

## 9. User Flows

### 9.1 New User Flow

```
Landing Page → Sign Up → Onboarding → Dashboard
```

1. User visits `/`
2. Clicks "Get Started" → `/auth/signup`
3. Signs up with email/password or Google
4. Redirected to `/app/onboarding` (if not completed)
5. Enters referral source + optional page ranges
6. Redirected to `/app/dashboard`

### 9.2 Recitation Flow

```
Dashboard → New Session → Record → Submit → Processing → Results
```

1. User clicks "Mulai Mengaji"
2. Selects surah, ayah range, mode (ZIYADAH/MUROJAAH)
3. Redirected to `/app/recitation/session`
4. Records audio (max 10 minutes)
5. Previews and re-records if needed
6. Submits → Deduct 10 tokens
7. Server processes: Upload → Transcribe → Validate → Calculate EXP
8. Redirected to `/app/recitation/result/{id}`
9. Views scores and feedback

### 9.3 Token Purchase Flow

```
Settings → Token Package → Payment → Success
```

1. User navigates to `/app/settings`
2. Views current token balance
3. Clicks "Top Up Token"
4. Selects package
5. Redirected to Midtrans payment page
6. Completes payment
7. Webhook receives payment confirmation
8. Tokens added to balance
9. User notified via toast

---

## 10. Future Enhancements

### 10.1 High Priority (v1.1)

| Feature | Description | Complexity |
|---------|-------------|-------------|
| Dark mode | Toggle light/dark theme | Low |
| PDF export | Download progress report | Medium |
| Daily reminders | Push notifications | Medium |
| Surah map | Visual progress of memorized surahs | Medium |
| Improved onboarding | Add total juz input | Low |

### 10.2 Medium Priority (v1.2)

| Feature | Description | Complexity |
|---------|-------------|-------------|
| Streaming audio | Real-time upload for long recitations | High |
| Social sharing | Share scores to social media | Low |
| More minigames | Beyond "Guess the Ayah" | Medium |
| Achievements | Badge system with icons | Medium |
| Leaderboard categories | Filter by surah, juz | Low |

### 10.3 Lower Priority (v1.3+)

| Feature | Description | Complexity |
|---------|-------------|-------------|
| Admin dashboard | User management, analytics | High |
| Community features | Peer review, mentor system | High |
| Real-time feedback | Streaming AI response | High |
| Subscription plans | Monthly token bundles | Medium |
| Multi-language | English support | Medium |
| Offline mode | PWA with caching | Medium |

---

## 11. Implementation Roadmap

### Phase 1: MVP (Current)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 | Authentication | ✅ |
| P0 | Onboarding | ✅ |
| P0 | Recitation flow | ✅ ~95% |
| P0 | EXP system | ✅ |
| P0 | Streak system | ✅ |
| P1 | Dashboard | ✅ |
| P1 | Progress report | ⚠️ ~60% |
| P1 | Leaderboard | ⚠️ ~50% |
| P1 | Settings page | ❌ |
| P1 | Token system | ❌ |
| P1 | Payment (Midtrans) | ❌ |
| P2 | Minigame | ❌ |
| P2 | Tests | ❌ |

### Phase 2: v1.1

| Feature |
|---------|
| Dark mode toggle |
| PDF export |
| Daily reminders |
| Surah progress visualization |
| Improved onboarding |

### Phase 3: v1.2

| Feature |
|---------|
| More minigames |
| Achievement system |
| Enhanced leaderboard |
| Social sharing |
| Subscription plans (future) |

### Phase 4: v1.3+

| Feature |
|---------|
| Admin dashboard |
| Community features |
| Real-time feedback |
| Multi-language |
| Mobile app (future) |

---

## Appendix

### A. Environment Variables

```env
# Database
DATABASE_URL="mysql://..."

# Auth
SESSION_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI
GEMINI_API_KEY="..."

# Cloud Storage
GCS_BUCKET_NAME="..."
GCS_PROJECT_ID="..."
GCS_KEY_FILE="..."

# Payment
MIDTRANS_SERVER_KEY="..."
MIDTRANS_CLIENT_KEY="..."
MIDTRANS_IS_PRODUCTION=false
```

### B. Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `requireUserId()` | `services/auth/auth.server.ts` | Auth guard |
| `calculateExp()` | `services/exp/exp.server.ts` | EXP calculation |
| `updateUserStreak()` | `services/streak/streak.server.ts` | Streak update |
| `deductTokens()` | `services/token/token.server.ts` | Token deduction |
| `createTransaction()` | `services/payment/payment.server.ts` | Payment creation |
| `transcribeAudio()` | `lib/gemini/gemini.ts` | Audio transcription |
| `validateRecitation()` | `lib/gemini/gemini.ts` | Recitation analysis |

### C. Route Structure

```
/                           → Landing page
/auth                       → Auth layout
  /signin                   → Sign in
  /signup                   → Sign up
  /signout                  → Sign out
  /google/callback          → OAuth callback
/app/onboarding            → Onboarding (no sidebar)
/app/recitation/session    → Recording (no sidebar)
/app                       → App layout (with sidebar)
  /dashboard               → Dashboard
  /recitation              → Recitation list
  /recitation/new          → New session
  /recitation/result/:id   → Results
  /progress-report         → Progress charts
  /game                    → Minigames
  /leaderboard             → Rankings
  /settings                → User settings
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-15*
*Project: Simakin - Gamified Al-Quran Memorization Platform*