# Gamification Feature — Implementation Plan

**Project**: Simakin  
**Branch**: `feature/recitation-flow`  
**Created**: 2026-05-02  
**Scope**: Complete gamification system — minigames, daily challenges, achievements, leaderboard wiring, and EXP bug fix

---

## Table of Contents

1. [Current State & Issues](#1-current-state--issues)
2. [Goals](#2-goals)
3. [Phase Overview](#3-phase-overview)
4. [Database Schema Reference](#4-database-schema-reference)
5. [Achievement Definitions](#5-achievement-definitions)
6. [EXP Reference Table](#6-exp-reference-table)
7. [Phase 1 — Foundation](#7-phase-1--foundation)
8. [Phase 2 — EXP Infrastructure](#8-phase-2--exp-infrastructure)
9. [Phase 3 — Minigames](#9-phase-3--minigames)
10. [Phase 4 — Daily Challenges](#10-phase-4--daily-challenges)
11. [Phase 5 — Achievement System](#11-phase-5--achievement-system)
12. [Phase 6 — Leaderboard Wiring](#12-phase-6--leaderboard-wiring)

---

## 1. Current State & Issues

### What exists (but is broken or incomplete)

| Item | File | Status | Issue |
|------|------|--------|-------|
| EXP calculation | `services/exp/exp.server.ts` | ✅ Logic correct | — |
| EXP storage per session | `routes/app/recitation/session/index.tsx:370` | ❌ Bug | `expEarned` never stored; dashboard recalculates using **current** streak, not session-time streak |
| `totalScore` on `User` | `prisma/schema.prisma` | ⚠️ Works but misleading name | Stores cumulative EXP, not a 0–100 score |
| Leaderboard page | `routes/app/leaderboard/index.tsx:11` | ❌ Dummy data | `userId = "temp-user-id"`, 20 hardcoded fake users, `Leaderboard` table never written |
| Game hub page | `routes/app/game/index.tsx` | ⚠️ UI only | 4 game cards link to non-existent routes; daily challenges are static with no tracking |
| `Achievement` model | `prisma/schema.prisma` | ⚠️ Schema exists | No seed data, no unlock logic, no UI |
| `Leaderboard` model | `prisma/schema.prisma` | ⚠️ Schema exists | Never populated |

### What does NOT exist yet

- `XPHistory` model
- `DailyChallenge` / `UserDailyChallenge` models
- `GameSession` model
- Any working route under `/app/game/*`
- Achievement unlock triggers
- Achievements page

---

## 2. Goals

1. **Fix** the EXP-per-session storage bug so historical data is accurate
2. **Build** 4 fully functional minigames using Equran API data
3. **Build** a daily challenge system with per-user progress tracking
4. **Build** an achievement system with unlock triggers and display
5. **Wire** the leaderboard to real `User.totalScore` data
6. **Add** XP history logging for progress charts and weekly leaderboard

---

## 3. Phase Overview

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
Foundation  EXP Fix   Minigames  Challenges  Achieve   Leaderboard
  (DB)     (Infra)    (Games)    (Daily)     (Badges)  (Real data)
```

| Phase | Name | Key Deliverable | Depends On |
|-------|------|-----------------|------------|
| 1 | Foundation | All DB models migrated, seed data ready | Nothing |
| 2 | EXP Infrastructure | Accurate EXP stored per session, XPHistory logging | Phase 1 |
| 3 | Minigames | 4 playable games with EXP rewards | Phase 2 |
| 4 | Daily Challenges | Real progress tracking on game hub | Phase 2, Phase 3 |
| 5 | Achievement System | Unlock triggers, toast notifications, achievements page | Phase 2, 3, 4 |
| 6 | Leaderboard Wiring | Real global + weekly rankings | Phase 2 |

**Total estimated new files**: 16  
**Total modified files**: 7

---

## 4. Database Schema Reference

### 4.1 Modify: `Recitation` — add `expEarned`

```prisma
model Recitation {
  // ... existing fields ...
  expEarned Int @default(0)  // EXP earned at session time (correct streak captured)
}
```

---

### 4.2 New model: `XPHistory`

```prisma
enum XPSource {
  RECITATION
  MINIGAME
  DAILY_CHALLENGE
}

model XPHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount    Int
  source    XPSource
  sourceId  String?  // recitationId, gameSessionId, or userDailyChallengeId
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt])
  @@index([userId, source])
}
```

---

### 4.3 New model: `GameSession`

```prisma
enum GameType {
  SAMBUNG_AYAT
  TEBAK_SURAH
  LENGKAPI_AYAT
  URUTAN_AYAT
}

model GameSession {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gameType       GameType
  totalQuestions Int      // Always 10
  correctAnswers Int
  expEarned      Int
  createdAt      DateTime @default(now())

  @@index([userId])
  @@index([userId, gameType])
  @@index([userId, createdAt])
}
```

---

### 4.4 New models: `DailyChallenge` + `UserDailyChallenge`

```prisma
enum ChallengeType {
  COMPLETE_SESSIONS
  REACH_ACCURACY
  WIN_GAMES
}

model DailyChallenge {
  id           String        @id @default(cuid())
  type         ChallengeType
  targetValue  Int           // 3 for sessions, 90 for accuracy, 2 for games
  expReward    Int
  description  String

  userProgress UserDailyChallenge[]
}

model UserDailyChallenge {
  id              String         @id @default(cuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  challengeId     String
  challenge       DailyChallenge @relation(fields: [challengeId], references: [id])
  date            String         // "YYYY-MM-DD" in user's local timezone
  currentProgress Int            @default(0)
  isCompleted     Boolean        @default(false)
  completedAt     DateTime?
  expAwarded      Boolean        @default(false)

  @@unique([userId, challengeId, date])
  @@index([userId, date])
}
```

---

### 4.5 User model additions

```prisma
model User {
  // ... existing fields ...
  xpHistory       XPHistory[]
  gameSessions    GameSession[]
  dailyChallenges UserDailyChallenge[]
}
```

---

## 5. Achievement Definitions

Seed these 14 records into the `Achievement` table.

| key | title | description | Trigger condition |
|-----|-------|-------------|-------------------|
| `first_recitation` | Langkah Pertama | Selesaikan sesi hafalan pertamamu | `totalSessions === 1` |
| `recitation_10` | Rajin Berlatih | Selesaikan 10 sesi hafalan | `totalSessions === 10` |
| `recitation_50` | Hafizh Sejati | Selesaikan 50 sesi hafalan | `totalSessions === 50` |
| `perfect_accuracy` | Sempurna! | Raih skor akurasi 100 dalam satu sesi | `lastAccuracyScore === 100` |
| `accuracy_90_five` | Konsisten | Raih akurasi ≥ 90% sebanyak 5 kali | DB count of sessions with accuracy ≥ 90 reaches 5 |
| `streak_3` | 3 Hari Berturut-turut | Pertahankan streak 3 hari | `streakDays === 3` |
| `streak_7` | Hafizh Mingguan | Pertahankan streak 7 hari | `streakDays === 7` |
| `streak_30` | Hafizh Sebulan | Pertahankan streak 30 hari | `streakDays === 30` |
| `first_game` | Gamer Quran | Mainkan minigame pertamamu | `totalGameSessions === 1` |
| `game_win_10` | Suka Bermain | Menangkan 10 ronde minigame | `totalGameWins === 10` |
| `perfect_game` | Jawaban Sempurna | Jawab 10/10 benar dalam satu ronde | `lastGameCorrect === 10` |
| `exp_1000` | Naik Level | Kumpulkan total 1.000 EXP | `totalScore >= 1000` |
| `exp_10000` | Master Hafizh | Kumpulkan total 10.000 EXP | `totalScore >= 10000` |
| `daily_3` | Konsisten Harian | Selesaikan semua tantangan harian 3 hari berturut-turut | 3 consecutive days with all 3 challenges completed |

> **Note on count-based achievements**: Use `===` (not `>=`) for milestone checks (`totalSessions === 10`) so they fire exactly once. Use `>=` only for cumulative thresholds (`totalScore >= 1000`) since score never decreases.

---

## 6. EXP Reference Table

### Recitation Sessions

```
EXP = avgScore × 5 × streakMultiplier × modeMultiplier × lengthMultiplier
```

| Example | Avg Score | Streak | Mode | Length | EXP |
|---------|-----------|--------|------|--------|-----|
| Poor session | 30 | 1.0x | MUROJAAH | 1.0x | 150 |
| Typical session | 80 | 1.25x | MUROJAAH | 1.0x | 500 |
| Good long session | 85 | 1.5x | ZIYADAH | 1.2x | 994 |
| Perfect max | 100 | 2.0x | ZIYADAH | 1.5x | 1,950 |

### Minigames

| Game | Difficulty | Per Correct | Completion Bonus | Perfect Bonus | Max EXP |
|------|------------|-------------|-----------------|---------------|---------|
| Tebak Surah | Easy | +5 | +20 | +50 | **120** |
| Sambung Ayat | Medium | +10 | +20 | +50 | **170** |
| Urutan Ayat | Medium | +10 | +20 | +50 | **170** |
| Lengkapi Ayat | Hard | +20 | +20 | +50 | **270** |

> A "win" = ≥ 7/10 correct. Completion bonus requires finishing all 10 questions.

### Daily Challenges

| Challenge | EXP Reward |
|-----------|------------|
| Selesaikan 3 Sesi Hafalan | +100 |
| Raih Skor Akurasi 90% | +150 |
| Menangkan 2 Ronde Minigame | +200 |
| **Total if all 3 completed** | **+450** |

---

## 7. Phase 1 — Foundation

**Goal**: All database models migrated and seed data ready. No feature code yet — just the DB layer every subsequent phase depends on.

**Prerequisites**: None

**Estimated time**: ~1 hour

---

### Tasks

#### 1.1 Update `prisma/schema.prisma`

- [ ] Add `expEarned Int @default(0)` field to `Recitation` model
- [ ] Add `XPSource` enum (`RECITATION`, `MINIGAME`, `DAILY_CHALLENGE`)
- [ ] Add `XPHistory` model (see §4.2)
- [ ] Add `GameType` enum (`SAMBUNG_AYAT`, `TEBAK_SURAH`, `LENGKAPI_AYAT`, `URUTAN_AYAT`)
- [ ] Add `GameSession` model (see §4.3)
- [ ] Add `ChallengeType` enum (`COMPLETE_SESSIONS`, `REACH_ACCURACY`, `WIN_GAMES`)
- [ ] Add `DailyChallenge` model (see §4.4)
- [ ] Add `UserDailyChallenge` model (see §4.4)
- [ ] Add `xpHistory`, `gameSessions`, `dailyChallenges` relations to `User` model (see §4.5)

#### 1.2 Run migration

```bash
npx prisma migrate dev --name gamification_schema
npx prisma generate
```

#### 1.3 Create or update `prisma/seed.ts`

- [ ] Seed 3 `DailyChallenge` records:
  - `COMPLETE_SESSIONS` / target: 3 / reward: 100 / desc: "Selesaikan 3 Sesi Hafalan"
  - `REACH_ACCURACY` / target: 90 / reward: 150 / desc: "Raih Skor Akurasi 90% dalam satu sesi"
  - `WIN_GAMES` / target: 2 / reward: 200 / desc: "Menangkan 2 Ronde Minigame (skor ≥ 70%)"
- [ ] Seed 14 `Achievement` records (see §5 for full list)
- [ ] Use `upsert` with `key` as the unique identifier so seed is safe to re-run

#### 1.4 Run seed

```bash
npx prisma db seed
```

---

### Verification

- [ ] `npx prisma studio` → confirm all 5 new models appear
- [ ] `DailyChallenge` table has exactly 3 rows
- [ ] `Achievement` table has exactly 14 rows
- [ ] `Recitation` model has `expEarned` column
- [ ] `pnpm typecheck` passes with no errors

---

## 8. Phase 2 — EXP Infrastructure

**Goal**: Fix the EXP-per-session bug. Every EXP gain from recitations is now stored accurately and logged to `XPHistory`. Dashboard shows correct historical values.

**Prerequisites**: Phase 1 complete

**Estimated time**: ~2 hours

---

### Tasks

#### 2.1 Create `app/services/xp-history/xp-history.server.ts`

```typescript
import { db } from "~/lib/db.server";
import { XPSource } from "@prisma/client";

export async function logXPGain(
  userId: string,
  amount: number,
  source: XPSource,
  sourceId?: string
): Promise<void> {
  await db.$transaction([
    db.xPHistory.create({
      data: { userId, amount, source, sourceId },
    }),
    db.user.update({
      where: { id: userId },
      data: { totalScore: { increment: amount } },
    }),
  ]);
}
```

> All future EXP increments to `User.totalScore` must go through `logXPGain()` — never call `db.user.update({ totalScore: increment })` directly elsewhere.

#### 2.2 Fix `app/routes/app/recitation/session/index.tsx`

**File**: `app/routes/app/recitation/session/index.tsx`

- [ ] Import `logXPGain` from `~/services/xp-history/xp-history.server`
- [ ] After `calculateExp()` call (~line 357), update the recitation record to store `expEarned`:
  ```typescript
  await db.recitation.update({
    where: { id: recitation.id },
    data: { expEarned: earnedExp },
  });
  ```
- [ ] Replace the existing `db.user.update({ totalScore: { increment: earnedExp } })` block with:
  ```typescript
  await logXPGain(userId, earnedExp, "RECITATION", recitation.id);
  ```
- [ ] Remove `totalScore` from the existing `db.user.update` call (keep only `totalSessions: { increment: 1 }`)

#### 2.3 Fix `app/routes/app/dashboard/index.tsx`

- [ ] In the `recentSessions` map (~line 68), replace `calculateExp()` call with:
  ```typescript
  exp: recitation.expEarned,
  ```
- [ ] Remove the `calculateExp` import (no longer needed in this file)
- [ ] Remove the comment `// Using current streak as approximation`

---

### Verification

- [ ] Complete a recitation session → check `Recitation.expEarned` in Prisma Studio is non-zero
- [ ] Check `XPHistory` table has a new row with `source: RECITATION`
- [ ] Check `User.totalScore` incremented by the correct amount
- [ ] Dashboard "recent sessions" shows the stored EXP value (not a recalculated one)
- [ ] `pnpm typecheck` passes

---

## 9. Phase 3 — Minigames

**Goal**: All 4 minigames are fully playable. Each game generates questions from the Equran API, tracks answers, saves a `GameSession`, and awards EXP via `logXPGain`.

**Prerequisites**: Phase 2 complete

**Estimated time**: ~6–8 hours

---

### Common Rules (apply to all 4 games)

- 10 questions per round
- 15-second countdown timer per question
- Questions generated server-side in the loader (pre-fetched, not on-demand)
- A "win" = ≥ 7/10 correct
- EXP awarded and saved in a single action call at end of round
- EXP breakdown: `(correctAnswers × perCorrectEXP) + completionBonus + perfectBonus`

---

### Tasks

#### 3.1 Create `app/services/game/game.server.ts`

Shared question generation helpers used by all 4 game routes.

- [ ] `getRandomSurah(minAyahs?: number): Promise<SurahData>` — fetch random surah from Equran API, optionally requiring minimum ayah count
- [ ] `getRandomAyah(surahData: SurahData, exclude?: 'first' | 'last'): AyahData` — pick random ayah with optional boundary exclusion
- [ ] `getDistractorSurahs(excludeNumber: number, count: number): Promise<string[]>` — pick N random surah names excluding the correct one
- [ ] `shuffleOptions<T>(correct: T, distractors: T[]): { options: T[]; correctIndex: number }` — shuffle 4 options and return correct index

#### 3.2 Create shared UI components

**Files to create**:
- `app/components/game/question-card.tsx` — wraps question text, shows current question number and timer
- `app/components/game/option-button.tsx` — single answer option, accepts `state: 'idle' | 'correct' | 'wrong'` prop for color feedback
- `app/components/game/game-progress.tsx` — "Question 3 of 10" progress bar
- `app/components/game/round-result.tsx` — end-of-round summary showing score, EXP earned, win/lose status, and "Play Again" button

#### 3.3 Build Game: Tebak Surah (Easy)

**Route file**: `app/routes/app/game/tebak-surah/index.tsx`

**Mechanic**: Show 2 consecutive ayahs → pick the correct surah name from 4 options.

Loader — generate 10 questions:
- [ ] For each question: pick random surah, fetch its ayahs, pick 2 consecutive ones
- [ ] Generate 3 distractor surah names using `getDistractorSurahs()`
- [ ] Shuffle options using `shuffleOptions()`
- [ ] Return array of 10 `TebakSurahQuestion` objects

Action — submit answers:
- [ ] Receive `answers: number[]` (one index per question)
- [ ] Calculate `correctAnswers` count
- [ ] Calculate `expEarned`: `(correctAnswers × 5) + 20 + (correctAnswers === 10 ? 50 : 0)`
- [ ] Save `GameSession` record
- [ ] Call `logXPGain(userId, expEarned, "MINIGAME", gameSession.id)`
- [ ] Return `{ correctAnswers, expEarned, isWin: correctAnswers >= 7 }`

#### 3.4 Build Game: Sambung Ayat (Medium)

**Route file**: `app/routes/app/game/sambung-ayat/index.tsx`

**Mechanic**: Show ayah N → pick the correct ayah N+1 from 4 options.

Loader — generate 10 questions:
- [ ] For each question: pick random surah with ≥ 2 ayahs, pick ayah N (not last)
- [ ] Correct answer = ayah N+1 from same surah
- [ ] 3 distractors = random ayahs from other surahs
- [ ] Shuffle using `shuffleOptions()`

Action — same structure as Tebak Surah, `perCorrectEXP = 10`

#### 3.5 Build Game: Urutan Ayat (Medium)

**Route file**: `app/routes/app/game/urutan-ayat/index.tsx`

**Mechanic**: Show 4 consecutive ayahs shuffled → pick which one comes first.

Loader — generate 10 questions:
- [ ] For each question: pick random surah with ≥ 5 ayahs, pick 4 consecutive ayahs
- [ ] Shuffle the 4 ayahs
- [ ] `correctIndex` = index of the ayah with the lowest original ayah number

Action — same structure, `perCorrectEXP = 10`

#### 3.6 Build Game: Lengkapi Ayat (Hard)

**Route file**: `app/routes/app/game/lengkapi-ayat/index.tsx`

**Mechanic**: Show ayah with one word blanked (`___`) → pick the correct missing word.

Loader — generate 10 questions:
- [ ] For each question: pick random surah and a random ayah
- [ ] Split ayah Arabic text by space
- [ ] Pick a word index: not first, not last, minimum 3 words total
- [ ] Replace that word with `___` in display text
- [ ] 3 distractors = random words from other ayahs in same surah (avoiding duplicates)
- [ ] Shuffle using `shuffleOptions()`

Action — same structure, `perCorrectEXP = 20`

#### 3.7 Update `app/routes/app/game/index.tsx`

- [ ] Update game card `title` and `href` values to match new routes and names:
  - "Tebak Surah" → `/app/game/tebak-surah` (Easy)
  - "Sambung Ayat" → `/app/game/sambung-ayat` (Medium)
  - "Urutan Ayat" → `/app/game/urutan-ayat` (Medium)
  - "Lengkapi Ayat" → `/app/game/lengkapi-ayat` (Hard)

#### 3.8 Register routes in `app/routes.ts`

- [ ] Add route for each of the 4 game paths under the app layout

---

### Verification

- [ ] Each game route loads without error
- [ ] 10 questions render per round
- [ ] Timer counts down from 15 per question
- [ ] Correct answer highlighted green, wrong answer highlighted red after selection
- [ ] Round result page shows correct score and EXP earned
- [ ] `GameSession` row created in DB after each round
- [ ] `XPHistory` row created with `source: MINIGAME`
- [ ] `User.totalScore` incremented correctly
- [ ] `pnpm typecheck` passes

---

## 10. Phase 4 — Daily Challenges

**Goal**: The 3 daily challenges on the game hub show real progress for the current day. Progress increments automatically when users complete sessions or win games. EXP is awarded on completion.

**Prerequisites**: Phase 2 (EXP logging), Phase 3 (minigames built — needed for WIN_GAMES trigger)

**Estimated time**: ~3 hours

---

### Tasks

#### 4.1 Create `app/services/daily-challenge/daily-challenge.server.ts`

```typescript
// Get or create today's 3 challenge progress records for a user
export async function getTodaysChallenges(
  userId: string,
  timezone: string
): Promise<UserDailyChallengeWithChallenge[]>

// Increment progress for a specific challenge type
// Returns { justCompleted: boolean; expAwarded: number }
export async function incrementChallengeProgress(
  userId: string,
  timezone: string,
  type: ChallengeType,
  value?: number
): Promise<{ justCompleted: boolean; expAwarded: number }>
```

**`getTodaysChallenges` implementation**:
1. Get today's date string in user's timezone:
   ```typescript
   const today = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
   // → "2026-05-02"
   ```
2. Fetch all 3 `DailyChallenge` records
3. For each challenge, `upsert` a `UserDailyChallenge` for `{ userId, challengeId, date: today }` with `currentProgress: 0` as default
4. Return all 3 with their challenge definition included

**`incrementChallengeProgress` implementation**:
1. Get today's date string (same as above)
2. Find the `DailyChallenge` by `type`
3. Find or create `UserDailyChallenge` for `{ userId, challengeId, date: today }`
4. If already `isCompleted`, return early — no double-rewarding
5. Increment `currentProgress` by `value` (default: 1)
6. If `currentProgress >= challenge.targetValue`:
   - Set `isCompleted: true`, `completedAt: now()`, `expAwarded: true`
   - Call `logXPGain(userId, challenge.expReward, "DAILY_CHALLENGE", userDailyChallengeId)`
   - Return `{ justCompleted: true, expAwarded: challenge.expReward }`
7. Otherwise return `{ justCompleted: false, expAwarded: 0 }`

#### 4.2 Wire into `app/routes/app/recitation/session/index.tsx`

After the existing `updateUserStreak` and `logXPGain` calls, add:

- [ ] Import `incrementChallengeProgress` from `~/services/daily-challenge/daily-challenge.server`
- [ ] Fetch user's timezone: `const profile = await db.userProfile.findUnique({ where: { userId }, select: { timezone: true } })`
- [ ] Call for `COMPLETE_SESSIONS` (always):
  ```typescript
  await incrementChallengeProgress(userId, profile.timezone, "COMPLETE_SESSIONS");
  ```
- [ ] Call for `REACH_ACCURACY` (conditionally):
  ```typescript
  if (cleanedMemorizeValidationResult.accuracy_score >= 90) {
    await incrementChallengeProgress(userId, profile.timezone, "REACH_ACCURACY");
  }
  ```

#### 4.3 Wire into each game action

In each of the 4 game route actions (`tebak-surah`, `sambung-ayat`, `urutan-ayat`, `lengkapi-ayat`):

- [ ] Import `incrementChallengeProgress`
- [ ] After saving `GameSession`, if `correctAnswers >= 7` (win):
  ```typescript
  await incrementChallengeProgress(userId, profile.timezone, "WIN_GAMES");
  ```

#### 4.4 Update `app/routes/app/game/index.tsx` loader

- [ ] Import `requireUserId` and wire auth
- [ ] Fetch user's timezone from `UserProfile`
- [ ] Call `getTodaysChallenges(userId, timezone)`
- [ ] Pass real progress to the component instead of the hardcoded `"0/3 sesi"` strings
- [ ] Remove `totalAchievements: 8` dummy value — replace with real count from DB:
  ```typescript
  const totalAchievements = await db.userAchievement.count({ where: { userId } });
  ```
- [ ] Replace `totalScore: 1450` dummy with `user.totalScore`

---

### Verification

- [ ] Game hub shows `0/3`, `0/1`, `0/2` progress initially
- [ ] Complete a recitation session → `COMPLETE_SESSIONS` increments to 1
- [ ] Complete a session with accuracy ≥ 90% → `REACH_ACCURACY` marks complete
- [ ] Win a game round → `WIN_GAMES` increments
- [ ] On completion: `XPHistory` row appears with `source: DAILY_CHALLENGE`
- [ ] Completing a challenge twice in one day does not award EXP twice
- [ ] Progress resets to 0 after midnight (verified by changing system date or checking the date logic)
- [ ] `pnpm typecheck` passes

---

## 11. Phase 5 — Achievement System

**Goal**: Achievements unlock automatically based on user actions. A toast notification appears when a new achievement is earned. An achievements page at `/app/achievements` shows all earned and locked badges.

**Prerequisites**: Phase 2 (recitation EXP), Phase 3 (game sessions), Phase 4 (daily challenges)

**Estimated time**: ~4 hours

---

### Tasks

#### 5.1 Create `app/services/achievement/achievement.server.ts`

```typescript
interface AchievementContext {
  totalSessions?: number
  streakDays?: number
  totalScore?: number
  lastAccuracyScore?: number
  lastGameCorrect?: number
  totalGameSessions?: number
  totalGameWins?: number
  consecutiveDailyCompletions?: number
}

// Check all achievement conditions and award any newly earned ones
// Returns array of newly awarded Achievement objects
export async function checkAndAwardAchievements(
  userId: string,
  context: AchievementContext
): Promise<Achievement[]>
```

**Implementation**:
1. Fetch all `Achievement` records
2. Fetch all already-awarded `UserAchievement` records for this user
3. Build a `Set<string>` of already-earned keys
4. Evaluate each rule against `context` — skip if already earned
5. For achievements requiring a DB count (e.g., `accuracy_90_five`), query inside the function
6. Batch-insert all newly earned achievements via `db.userAchievement.createMany()`
7. Return the newly earned `Achievement` objects

#### 5.2 Wire into `app/routes/app/recitation/session/index.tsx`

After EXP logging and challenge progress updates, add:

- [ ] Import `checkAndAwardAchievements`
- [ ] Fetch updated user stats post-session:
  ```typescript
  const updatedUser = await db.user.findUnique({
    where: { id: userId },
    select: { totalSessions: true, streakDays: true, totalScore: true }
  });
  ```
- [ ] Call:
  ```typescript
  const newAchievements = await checkAndAwardAchievements(userId, {
    totalSessions: updatedUser.totalSessions,
    streakDays: updatedUser.streakDays,
    totalScore: updatedUser.totalScore,
    lastAccuracyScore: cleanedMemorizeValidationResult.accuracy_score,
  });
  ```
- [ ] Pass `newAchievements` as part of the redirect — store in session flash or pass as query param with IDs, so the result page can show toasts

#### 5.3 Wire into each game action

- [ ] After saving `GameSession`, call `checkAndAwardAchievements` with:
  ```typescript
  {
    totalGameSessions: count of all user game sessions,
    totalGameWins: count of sessions with correctAnswers >= 7,
    lastGameCorrect: correctAnswers,
    totalScore: updatedUser.totalScore,
  }
  ```
- [ ] Return new achievements in action response for toast display

#### 5.4 Wire into daily challenge completion

In `incrementChallengeProgress`, when `justCompleted === true`:
- [ ] Call `checkAndAwardAchievements` with `consecutiveDailyCompletions` (query last N days of full-completion)

#### 5.5 Toast notification in UI

- [ ] In recitation result page (`routes/app/recitation/result/[id]/index.tsx`): if `newAchievements` passed via session flash, show a `sonner` toast for each:
  ```typescript
  toast.success(`🏆 Achievement unlocked: ${achievement.title}`)
  ```
- [ ] Same toast logic in each game round result

#### 5.6 Create `app/routes/app/achievements/index.tsx`

Loader:
- [ ] `requireUserId`
- [ ] Fetch all `Achievement` records
- [ ] Fetch all `UserAchievement` records for this user
- [ ] Return merged list: each achievement with `earned: boolean` and `awardedAt?: Date`

Component:
- [ ] Grid layout (3 columns desktop, 2 columns mobile)
- [ ] Each achievement card shows: icon (emoji placeholder), title, description
- [ ] Earned: full color, show `awardedAt` date
- [ ] Locked: `opacity-40 grayscale`, show "Terkunci"
- [ ] Progress summary at top: "X / 14 achievements unlocked"

#### 5.7 Update sidebar and routes

- [ ] Add "Achievements" link to `app/components/app-sidebar.tsx` (Trophy icon)
- [ ] Register `/app/achievements` in `app/routes.ts`

---

### Verification

- [ ] Complete first recitation session → `first_recitation` achievement appears as toast
- [ ] Reach 7-day streak → `streak_7` toast
- [ ] Get 10/10 in a game → `perfect_game` toast
- [ ] Achievements page shows all 14, correct ones marked as earned
- [ ] Earning the same achievement twice does not create a duplicate `UserAchievement` row
- [ ] `pnpm typecheck` passes

---

## 12. Phase 6 — Leaderboard Wiring

**Goal**: Replace all dummy data in the leaderboard with real database queries. Global leaderboard ranks users by `User.totalScore`. Weekly leaderboard sums `XPHistory` for the current week.

**Prerequisites**: Phase 2 (XPHistory in place)

**Estimated time**: ~2 hours

---

### Tasks

#### 6.1 Rewrite `app/routes/app/leaderboard/index.tsx` loader

- [ ] Replace `const userId = "temp-user-id"` with `const userId = await requireUserId(request)`
- [ ] Remove all dummy data arrays

**Global leaderboard** (top 50 by `User.totalScore`):
```typescript
const topUsers = await db.user.findMany({
  select: {
    id: true,
    username: true,
    fullName: true,
    totalScore: true,
    streakDays: true,
  },
  orderBy: { totalScore: 'desc' },
  take: 50,
});

const globalLeaderboard = topUsers.map((user, index) => ({
  rank: index + 1,
  username: user.username,
  fullName: user.fullName ?? user.username,
  score: Math.round(user.totalScore),
  streak: user.streakDays,
  isCurrentUser: user.id === userId,
}));
```

**Current user's rank** (if not in top 50):
```typescript
const currentUser = await db.user.findUnique({
  where: { id: userId },
  select: { totalScore: true },
});

const userRankPosition = await db.user.count({
  where: { totalScore: { gt: currentUser?.totalScore ?? 0 } },
}) + 1;
```

**Weekly leaderboard** (sum of `XPHistory` for current week):
```typescript
import { startOfWeek } from "date-fns";

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

const weeklyRaw = await db.xPHistory.groupBy({
  by: ['userId'],
  where: { createdAt: { gte: weekStart } },
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } },
  take: 50,
});

// Fetch usernames for weekly results
const weeklyUserIds = weeklyRaw.map(r => r.userId);
const weeklyUsers = await db.user.findMany({
  where: { id: { in: weeklyUserIds } },
  select: { id: true, username: true, fullName: true },
});

const weeklyLeaderboard = weeklyRaw.map((entry, index) => {
  const user = weeklyUsers.find(u => u.id === entry.userId)!;
  return {
    rank: index + 1,
    username: user.username,
    fullName: user.fullName ?? user.username,
    score: entry._sum.amount ?? 0,
    isCurrentUser: entry.userId === userId,
  };
});
```

#### 6.2 Update leaderboard component

- [ ] Add tab switcher between "Global" and "Minggu Ini" (weekly)
- [ ] Show `—` for weekly streak column (not applicable)
- [ ] If current user is not in top 50, show their rank in the "Peringkat Anda" card

---

### Verification

- [ ] Leaderboard page loads without error using real auth
- [ ] Global tab shows real users ordered by `totalScore`
- [ ] Current user's row is highlighted
- [ ] "Peringkat Anda" card shows correct rank and score
- [ ] Weekly tab shows correct XP summed from Monday to now
- [ ] `pnpm typecheck` passes

---

*Plan version: 2.0*  
*Last updated: 2026-05-02*
