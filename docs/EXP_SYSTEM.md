# EXP (Experience Points) System Documentation

## Overview

The EXP system is a gamification feature designed to reward users for completing Qur'an recitation sessions. Unlike a simple score system, the EXP calculation uses a **weighted multi-factor formula** that encourages consistent practice, challenges users to memorize new content, and rewards effort proportional to the difficulty.

## Why Not Use Simple Score Average?

Initially, we considered using the average of accuracy, tajweed, and fluency scores (0-100 range) directly as EXP. However, this approach had several drawbacks:

1. **Too Similar to Score**: EXP would be virtually identical to the overall performance score, making it redundant.
2. **Slow Progression**: Earning 70-90 EXP per session feels unrewarding and slow.
3. **No Incentive for Good Habits**: Simple averaging doesn't encourage daily consistency or challenging oneself.
4. **Lack of Engagement**: Numbers in the 0-100 range are less satisfying than larger values (hundreds or thousands).

## EXP Calculation Formula

The EXP calculation uses a **Weighted Factor System** with multiple multipliers:

```typescript
EXP = baseScore × baseMultiplier × streakBonus × modeBonus × lengthBonus
```

### Step-by-Step Breakdown

#### 1. Base Score Calculation

```typescript
baseScore = (accuracyScore + tajweedScore + fluencyScore) / 3;
```

- Average of the three performance metrics
- Range: 0-100

#### 2. Base Multiplier

```typescript
baseExp = baseScore × 5
```

- Fixed multiplier of **5x** to make EXP more rewarding
- Converts 0-100 range to 0-500 range
- Example: Score of 85 → 425 base EXP

#### 3. Streak Bonus

Encourages daily consistency:

| Streak Days | Multiplier | Bonus |
| ----------- | ---------- | ----- |
| 0-2 days    | 1.0x       | +0%   |
| 3-6 days    | 1.25x      | +25%  |
| 7-13 days   | 1.5x       | +50%  |
| 14+ days    | 2.0x       | +100% |

**Philosophy**: Reward users who practice every day. A 2-week streak doubles the EXP!

#### 4. Mode Bonus

Incentivizes new memorization (ZIYADAH) over review (MUROJAAH):

| Mode     | Multiplier | Bonus | Reasoning                      |
| -------- | ---------- | ----- | ------------------------------ |
| ZIYADAH  | 1.3x       | +30%  | New memorization is harder     |
| MUROJAAH | 1.0x       | +0%   | Review is important but easier |

**Philosophy**: Learning new content deserves more reward than reviewing known material.

#### 5. Length Bonus

Rewards effort for longer passages:

| Ayah Count | Multiplier | Bonus |
| ---------- | ---------- | ----- |
| 1-4 ayat   | 1.0x       | +0%   |
| 5-9 ayat   | 1.1x       | +10%  |
| 10-19 ayat | 1.2x       | +20%  |
| 20+ ayat   | 1.5x       | +50%  |

**Philosophy**: Memorizing/reciting more verses requires more effort and time.

## Example Calculations

### Example 1: Beginner Session

```typescript
Parameters:
- Accuracy: 70
- Tajweed: 75
- Fluency: 68
- Mode: MUROJAAH
- Ayat: 3 (Al-Ikhlas, ayat 1-3)
- Streak: 1 day

Calculation:
1. Base score = (70 + 75 + 68) / 3 = 71
2. Base EXP = 71 × 5 = 355
3. Streak bonus = 1.0x (only 1 day)
4. Mode bonus = 1.0x (MUROJAAH)
5. Length bonus = 1.0x (only 3 ayat)

Total EXP = 355 × 1.0 × 1.0 × 1.0 = 355 EXP
```

### Example 2: Intermediate Session

```typescript
Parameters:
- Accuracy: 85
- Tajweed: 88
- Fluency: 82
- Mode: ZIYADAH
- Ayat: 7 (Al-Baqarah, ayat 1-7)
- Streak: 5 days

Calculation:
1. Base score = (85 + 88 + 82) / 3 = 85
2. Base EXP = 85 × 5 = 425
3. Streak bonus = 1.25x (5 days streak)
4. Mode bonus = 1.3x (ZIYADAH)
5. Length bonus = 1.1x (7 ayat)

Total EXP = 425 × 1.25 × 1.3 × 1.1 = 762 EXP
```

### Example 3: Advanced Session

```typescript
Parameters:
- Accuracy: 95
- Tajweed: 92
- Fluency: 90
- Mode: ZIYADAH
- Ayat: 15 (Al-Kahf, ayat 1-15)
- Streak: 14 days

Calculation:
1. Base score = (95 + 92 + 90) / 3 = 92.33
2. Base EXP = 92.33 × 5 = 461.67
3. Streak bonus = 2.0x (14 days streak!)
4. Mode bonus = 1.3x (ZIYADAH)
5. Length bonus = 1.2x (15 ayat)

Total EXP = 461.67 × 2.0 × 1.3 × 1.2 = 1,441 EXP
```

### Example 4: Master Session

```typescript
Parameters:
- Accuracy: 98
- Tajweed: 96
- Fluency: 95
- Mode: ZIYADAH
- Ayat: 25 (Al-Baqarah, ayat 1-25)
- Streak: 30 days

Calculation:
1. Base score = (98 + 96 + 95) / 3 = 96.33
2. Base EXP = 96.33 × 5 = 481.67
3. Streak bonus = 2.0x (30 days streak!)
4. Mode bonus = 1.3x (ZIYADAH)
5. Length bonus = 1.5x (25 ayat)

Total EXP = 481.67 × 2.0 × 1.3 × 1.5 = 1,877 EXP
```

## EXP Range Table

Here's a quick reference for expected EXP ranges:

| Performance Level | Base Score | Base EXP | Min EXP\* | Max EXP\*\* |
| ----------------- | ---------- | -------- | --------- | ----------- |
| Poor (0-50)       | 0-50       | 0-250    | 0         | 975         |
| Fair (51-70)      | 51-70      | 255-350  | 255       | 1,365       |
| Good (71-85)      | 71-85      | 355-425  | 355       | 1,658       |
| Excellent (86-95) | 86-95      | 430-475  | 430       | 1,853       |
| Perfect (96-100)  | 96-100     | 480-500  | 480       | 1,950       |

\*Min EXP = No streak, MUROJAAH, 1-4 ayat
\*\*Max EXP = 14+ days streak, ZIYADAH, 20+ ayat

## Implementation

### Service Location

```
app/services/exp/exp.server.ts
```

### Main Function

```typescript
calculateExp({
    accuracyScore: number,
    tajweedScore: number,
    fluencyScore: number,
    mode: 'ZIYADAH' | 'MUROJAAH',
    startAyah: number,
    endAyah: number,
    streakDays: number,
}): number
```

### Helper Functions

#### 1. Get EXP Range

Calculates minimum and maximum possible EXP for a session (useful for previews):

```typescript
getExpRange({
  mode: "ZIYADAH",
  startAyah: 1,
  endAyah: 10,
  streakDays: 7,
});
// Returns: { min: 0, max: 975 }
```

#### 2. Get EXP Breakdown

Shows detailed breakdown of how EXP was calculated:

```typescript
getExpBreakdown({
  accuracyScore: 85,
  tajweedScore: 88,
  fluencyScore: 82,
  mode: "ZIYADAH",
  startAyah: 1,
  endAyah: 7,
  streakDays: 5,
});
/* Returns:
{
    baseScore: 85,
    baseExp: 425,
    streakBonus: 25,    // 25% bonus
    modeBonus: 30,      // 30% bonus
    lengthBonus: 10,    // 10% bonus
    totalExp: 762
}
*/
```

## Integration Points

### 1. Memorization Session (`app/routes/app/memorization/session/index.tsx`)

After AI validation and before saving to database:

```typescript
// Update streak first (needed for EXP calculation)
const newStreak = await updateUserStreak(userId);

// Calculate EXP with weighted system
const earnedExp = calculateExp({
  accuracyScore: validationResult.accuracy_score,
  tajweedScore: validationResult.tajweed_score,
  fluencyScore: validationResult.fluency_score,
  mode: type === "ziyadah" ? "ZIYADAH" : "MUROJAAH",
  startAyah: parseInt(startAyat),
  endAyah: parseInt(endAyat),
  streakDays: newStreak,
});

// Update user's total EXP
await db.user.update({
  where: { id: userId },
  data: {
    totalSessions: { increment: 1 },
    totalScore: { increment: earnedExp }, // totalScore stores total EXP
  },
});
```

### 2. Dashboard (`app/routes/app/dashboard/index.tsx`)

Display total EXP and recent sessions with calculated EXP:

```typescript
// Fetch user's total EXP
const user = await db.user.findUnique({
  where: { id: userId },
  select: { totalScore: true }, // totalScore = total EXP
});

// Calculate EXP for each recent session
const recentSessions = recitations.map((recitation) => {
  const exp = calculateExp({
    accuracyScore: recitation.feedback.accuracyScore,
    tajweedScore: recitation.feedback.tajweedScore,
    fluencyScore: recitation.feedback.fluencyScore,
    mode: recitation.mode,
    startAyah: recitation.startAyah,
    endAyah: recitation.endAyah,
    streakDays: currentStreak,
  });

  return {
    id: recitation.id,
    surah: surahName,
    exp: exp,
    // ... other fields
  };
});
```

### 3. Leaderboard (Future Implementation)

Use `user.totalScore` for global rankings:

```typescript
const topUsers = await db.user.findMany({
  orderBy: {
    totalScore: "desc", // Rank by total EXP
  },
  take: 50,
});
```

## UI Display

### Total EXP Display

```tsx
<p className="text-sm text-muted-foreground">Total EXP</p>
<p className="text-2xl font-bold">{formatNumber(totalEXP)}</p>
```

### Session EXP Reward

```tsx
<p className="text-sm font-medium">+{exp} EXP</p>
```

### EXP Breakdown (Optional)

```tsx
<div className="space-y-2">
  <p>Base EXP: {breakdown.baseExp}</p>
  {breakdown.streakBonus > 0 && (
    <p className="text-green-600">+{breakdown.streakBonus}% Streak Bonus</p>
  )}
  {breakdown.modeBonus > 0 && (
    <p className="text-blue-600">+{breakdown.modeBonus}% ZIYADAH Bonus</p>
  )}
  {breakdown.lengthBonus > 0 && (
    <p className="text-purple-600">+{breakdown.lengthBonus}% Length Bonus</p>
  )}
  <p className="font-bold">Total: {breakdown.totalExp} EXP</p>
</div>
```

## Database Schema

### User Model

```prisma
model User {
  // ...
  totalScore   Float   @default(0)  // Stores total EXP earned
  streakDays   Int     @default(0)  // Used in EXP calculation
  // ...
}
```

**Note**: The field is named `totalScore` for historical reasons, but it actually stores the total EXP accumulated by the user.

## Balancing Considerations

### Current Multipliers

- Base: 5x
- Streak: 1.0x - 2.0x
- Mode: 1.0x - 1.3x
- Length: 1.0x - 1.5x

### Why These Values?

1. **Base Multiplier (5x)**: Converts 0-100 scores into 0-500 range, making progression feel more substantial.

2. **Streak Bonus (up to 2x)**: Doubles EXP for 2-week streaks to strongly encourage daily practice. This is the highest multiplier because consistency is the most important habit for memorization.

3. **Mode Bonus (1.3x)**: 30% bonus for new memorization (ZIYADAH) is significant but not overwhelming. Review (MUROJAAH) is still important and gets base rewards.

4. **Length Bonus (up to 1.5x)**: 50% bonus for 20+ verses rewards ambitious users without making short sessions feel unrewarding.

### Adjustment Guidelines

If progression feels too slow:

- Increase base multiplier (5 → 10)
- Increase streak bonuses
- Add daily/weekly EXP bonuses

If progression feels too fast:

- Decrease base multiplier (5 → 3)
- Adjust streak thresholds (7 days → 14 days for 1.5x)
- Reduce mode/length bonuses

### Future Enhancements

1. **Perfect Score Bonus**: Extra multiplier for 100% accuracy (e.g., 1.2x)
2. **First Completion Bonus**: Bonus EXP for first time completing a surah
3. **Daily Quest Bonus**: Bonus EXP for completing daily challenges
4. **Combo System**: Consecutive perfect sessions give increasing bonuses
5. **Weekend Bonus**: Higher multipliers on weekends to encourage practice
6. **Ramadan Special**: Increased multipliers during Ramadan

## Testing

### Manual Testing Scenarios

Test the EXP calculation with these scenarios:

```typescript
// Test 1: Minimum EXP (zero scores, no bonuses)
calculateExp({
  accuracyScore: 0,
  tajweedScore: 0,
  fluencyScore: 0,
  mode: "MUROJAAH",
  startAyah: 1,
  endAyah: 1,
  streakDays: 0,
});
// Expected: 0 EXP

// Test 2: Maximum EXP (perfect scores, all bonuses)
calculateExp({
  accuracyScore: 100,
  tajweedScore: 100,
  fluencyScore: 100,
  mode: "ZIYADAH",
  startAyah: 1,
  endAyah: 30,
  streakDays: 30,
});
// Expected: ~1,950 EXP

// Test 3: Typical beginner
calculateExp({
  accuracyScore: 70,
  tajweedScore: 65,
  fluencyScore: 72,
  mode: "MUROJAAH",
  startAyah: 1,
  endAyah: 3,
  streakDays: 1,
});
// Expected: ~345 EXP

// Test 4: Typical intermediate
calculateExp({
  accuracyScore: 85,
  tajweedScore: 82,
  fluencyScore: 88,
  mode: "ZIYADAH",
  startAyah: 1,
  endAyah: 7,
  streakDays: 5,
});
// Expected: ~750 EXP
```

## Frequently Asked Questions

### Q: Why is it called `totalScore` in the database but represents EXP?

**A**: The field was named before the EXP system redesign. It's kept for backward compatibility. Consider it as "total experience score."

### Q: Can EXP decrease?

**A**: No, EXP only increases. Even poor performance sessions give some EXP (minimum ~0-100).

### Q: What happens if streak breaks?

**A**: The streak bonus returns to 1.0x, but previously earned EXP is never lost.

### Q: Is there a level system?

**A**: Not yet. Currently, EXP is cumulative. A level system could be added in the future (e.g., Level 1 = 1000 EXP, Level 2 = 3000 EXP, etc.).

### Q: Why doesn't review (MUROJAAH) get bonus EXP?

**A**: Review is important but generally easier than new memorization. The base EXP (0-500) is still awarded for review sessions.

### Q: How do I encourage users to practice daily?

**A**: The streak bonus system does this! Maintaining a 7-day streak gives +50% EXP, and 14-day streak gives +100% EXP.

## Changelog

### Version 1.0 (October 28, 2025)

- Initial implementation of weighted EXP system
- Base multiplier: 5x
- Streak bonus: up to 2.0x
- Mode bonus: 1.3x for ZIYADAH
- Length bonus: up to 1.5x for 20+ ayat
- Replaced simple score average with multi-factor calculation

### Future Versions

- Add level system based on total EXP
- Implement achievement system tied to EXP milestones
- Add daily/weekly quests for bonus EXP
- Create EXP leaderboard rankings

## References

- Streak System: See `docs/STREAK_IMPLEMENTATION.md`
- Memorization Flow: See `docs/MEMORIZATION_IMPLEMENTATION.md`
- Database Schema: See `prisma/schema.prisma`
