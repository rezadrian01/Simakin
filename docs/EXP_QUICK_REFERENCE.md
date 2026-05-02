# EXP System - Quick Reference

## TL;DR

The EXP system rewards users for completing recitation sessions using a weighted formula that encourages:

- **Daily consistency** (streak bonus)
- **New memorization** (ZIYADAH bonus)
- **Challenging themselves** (length bonus)

## Formula

```
EXP = baseScore × 5 × streakBonus × modeBonus × lengthBonus
```

Where:

- `baseScore` = average of accuracy, tajweed, and fluency (0-100)
- Multipliers range from 1.0x to 2.0x depending on various factors

## Multiplier Tables

### Streak Bonus

| Days | Multiplier | Example Impact    |
| ---- | ---------- | ----------------- |
| 0-2  | 1.0x       | 425 EXP → 425 EXP |
| 3-6  | 1.25x      | 425 EXP → 531 EXP |
| 7-13 | 1.5x       | 425 EXP → 638 EXP |
| 14+  | 2.0x       | 425 EXP → 850 EXP |

### Mode Bonus

| Mode     | Multiplier | Reasoning                      |
| -------- | ---------- | ------------------------------ |
| ZIYADAH  | 1.3x       | New memorization is harder     |
| MUROJAAH | 1.0x       | Review is important but easier |

### Length Bonus

| Ayah Count | Multiplier | Example Impact    |
| ---------- | ---------- | ----------------- |
| 1-4        | 1.0x       | 425 EXP → 425 EXP |
| 5-9        | 1.1x       | 425 EXP → 468 EXP |
| 10-19      | 1.2x       | 425 EXP → 510 EXP |
| 20+        | 1.5x       | 425 EXP → 638 EXP |

## EXP Range Examples

### Minimum Configuration

- Score: 0/100
- Mode: MUROJAAH
- Ayat: 1
- Streak: 0 days
- **Result: 0 EXP**

### Typical Beginner

- Score: 70/100
- Mode: MUROJAAH
- Ayat: 3
- Streak: 1 day
- **Result: ~355 EXP**

### Typical Intermediate

- Score: 85/100
- Mode: ZIYADAH
- Ayat: 7
- Streak: 5 days
- **Result: ~762 EXP**

### Advanced User

- Score: 92/100
- Mode: ZIYADAH
- Ayat: 15
- Streak: 14 days
- **Result: ~1,441 EXP**

### Maximum Configuration

- Score: 100/100
- Mode: ZIYADAH
- Ayat: 30
- Streak: 30 days
- **Result: ~1,950 EXP**

## Usage

```typescript
import { calculateExp } from "~/services/exp/exp.server";

const exp = calculateExp({
  accuracyScore: 85,
  tajweedScore: 88,
  fluencyScore: 82,
  mode: "ZIYADAH",
  startAyah: 1,
  endAyah: 7,
  streakDays: 5,
});
// Returns: 762
```

## Key Features

✅ **Progressive Rewards**: Higher scores = more EXP
✅ **Streak Incentive**: Daily practice doubles your EXP after 2 weeks
✅ **Challenge Bonus**: New memorization gets 30% more EXP
✅ **Effort Recognition**: Longer passages get higher rewards
✅ **No Penalties**: Even poor performance earns some EXP

## Files

- **Service**: `app/services/exp/exp.server.ts`
- **Documentation**: `docs/EXP_SYSTEM.md`
- **Integration**:
  - `app/routes/app/memorization/session/index.tsx` (calculation)
  - `app/routes/app/dashboard/index.tsx` (display)

## See Also

- Full Documentation: `docs/EXP_SYSTEM.md`
- Streak System: `docs/STREAK_IMPLEMENTATION.md`
- Memorization Flow: `docs/MEMORIZATION_IMPLEMENTATION.md`
