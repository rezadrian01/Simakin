# Streak Implementation Documentation

## Overview

The streak feature in Simakin is designed to encourage users to be consistent in completing their memorization sessions (both ziyadah and murojaah). The stre### Streak Active (Dashboard)

```
┌─────────────────────────────────┐
│  7 days                         │
│  Current Streak                 │
└─────────────────────────────────┘
```

### Streak on Progress Report

````
┌─────────────────────────────────┐
│  Avg. Tajweed   │  Streak       │
│      89%        │  7 days       │
└─────────────────────────────────┘
```ry day when a user completes at least 1 session.

## Database Schema

### Additional Fields in User Model

```prisma
model User {
  // ... existing fields

  // Streak tracking
  streakDays       Int       @default(0)
  lastActivityDate DateTime?

  // ... other fields
}

model UserProfile {
  // ... existing fields

  timezone String @default("Asia/Jakarta") // User's timezone for streak calculation

  // ... other fields
}
````

**Field Details:**

- `streakDays`: Number of consecutive days the user has completed sessions
- `lastActivityDate`: Timestamp of the user's last activity (for tracking)
- `timezone` (in UserProfile): User's timezone (IANA timezone format) for accurate day calculations

## Business Logic

### Timezone Handling

All streak calculations use **user's local timezone** (stored in `UserProfile.timezone`). This ensures:

- Days are calculated based on the user's local time, not server time
- A user in Tokyo (UTC+9) and a user in New York (UTC-5) both get accurate daily streaks
- Default timezone is `Asia/Jakarta` (UTC+7) if not specified

### Streak Rules

1. **Increment Streak** (Consecutive Days)

   - If the user completes a session on a different day from their last activity (in their timezone)
   - If the day difference = 1 day, streak increases by 1
   - Example: Last activity = October 27 (user's timezone), Today = October 28 → streak + 1

2. **Maintain Streak** (Same Day)

   - If the user completes multiple sessions in the same day
   - Streak does not increase, only timestamp is updated
   - Example: Last activity = October 28 morning, Now = October 28 afternoon → streak remains the same

3. **Reset Streak** (Broken)

   - If the user does not complete a session for more than 1 day
   - Streak resets to 1 (not 0, because the user just completed a session)
   - Example: Last activity = October 26, Today = October 28 → streak = 1

4. **First Time**

   - If the user has never completed a session before
   - Streak = 1

## Implementation

### 1. Streak Utility Functions (`app/services/streak/streak.server.ts`)

#### Helper Functions

- `getStartOfDayInTimezone(date, timezone)`: Converts a date to the start of day (00:00:00) in user's timezone
- `getCurrentDateInTimezone(timezone)`: Gets current date in user's timezone

These helpers ensure all day calculations respect the user's local timezone.

#### `updateUserStreak(userId: string): Promise<number>`

This function is called every time a user completes a session.

**Logic:**

```typescript
- Fetch user data (streakDays, lastActivityDate, timezone)
- Get user's timezone from profile (defaults to "Asia/Jakarta")
- Convert current time and last activity to user's timezone
- Calculate the day difference between today and lastActivityDate (in user's timezone)
- If difference = 0 → streak remains the same (activity on the same day)
- If difference = 1 → streak + 1 (consecutive days)
- If difference > 1 → streak = 1 (reset)
- Update database (streakDays, lastActivityDate)
- Return new streak value
```

**Usage:**

```typescript
const newStreak = await updateUserStreak(userId);
console.log(`Streak updated to: ${newStreak}`);
```

#### `getUserStreak(userId: string): Promise<number>`

Function to read the user's current streak.

**Logic:**

```typescript
- Fetch user data (streakDays, lastActivityDate, timezone)
- Get user's timezone from profile (defaults to "Asia/Jakarta")
- Convert current time and last activity to user's timezone
- Calculate the day difference between today and lastActivityDate (in user's timezone)
- If difference > 1 → return 0 (streak is broken, but DB not updated yet)
- If difference <= 1 → return streakDays
```

**Usage:**

```typescript
const currentStreak = await getUserStreak(userId);
```

**Note:** This function only reads, does not update the database. Used to display streak in the UI.

### 2. Integration Points

#### A. Memorization Session Action (`app/routes/app/memorization/session/index.tsx`)

Every time a user completes a session (both ziyadah and murojaah):

```typescript
// After saving recitation to database
await updateUserStreak(userId);
```

**Flow:**

1. User submits audio recording
2. AI processing (transcribe + validate)
3. Save recitation & feedback to database
4. Update user stats (totalSessions, totalScore)
5. **Update streak** ← streak logic triggered here
6. Redirect to result page

#### B. Dashboard (`app/routes/app/dashboard/index.tsx`)

Display current streak:

```typescript
const currentStreak = await getUserStreak(userId);

return {
  userStats: {
    currentStreak: currentStreak,
    // ... other stats
  },
};
```

#### C. Game Page (`app/routes/app/game/index.tsx`)

```typescript
const streak = await getUserStreak(userId);
return { streak };
```

#### D. Progress Report (`app/routes/app/progress-report/index.tsx`)

```typescript
const streak = await getUserStreak(userId);
return {
  stats: {
    streak: streak,
    // ... other stats
  },
};
```

## UI Display

Streak is displayed on several pages:

### Dashboard

```tsx
<Flame className="w-5 h-5 text-orange-500" />
<span>{userStats.currentStreak} days</span>
```

### Game Page

```tsx
<Zap className="w-5 h-5 text-orange-600" />
<p>{data.streak}</p>
<p>Streak</p>
```

### Progress Report

```tsx
<p>{data.stats.streak}</p>
<p>Streak (days)</p>
```

## Visual Examples

### Streak Active (Dashboard)

```
┌─────────────────────────────────┐
│  🔥 7 days                      │
│  Current Streak                │
└─────────────────────────────────┘
```

### Streak on Progress Report

```
┌─────────────────────────────────┐
│  Avg. Tajweed   │  Streak       │
│      89%        │  7 days       │
└─────────────────────────────────┘
```

## Future Enhancements

1. **Streak Achievements**

   - Badge for 7-day streak
   - Badge for 30-day streak
   - Badge for 100-day streak

2. **Streak Reminder**

   - Notification if user hasn't completed a session today
   - Reminder before streak breaks

3. **Leaderboard Streak**

   - Ranking based on longest streak
   - Hall of fame for highest streaks

4. **Streak Recovery**

   - 1-day grace period (streak freeze)
   - Reward for maintaining long streaks

## Notes

- Streak only counts days, not number of sessions
- Multiple sessions in 1 day still count as 1 day of streak
- Streak resets when gap > 1 day, no grace period (can be added in the future)
- **Timezone uses user's local timezone** for accurate day calculations based on their location

## Related Files

- `prisma/schema.prisma` - Database schema
- `app/services/streak/streak.server.ts` - Streak utility functions
- `app/routes/app/memorization/session/index.tsx` - Streak update trigger
- `app/routes/app/dashboard/index.tsx` - Streak display
- `app/routes/app/game/index.tsx` - Streak display
- `app/routes/app/progress-report/index.tsx` - Streak display

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
