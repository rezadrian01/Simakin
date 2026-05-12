# Simakin Project Implementation Plan

## Overview
- **Project**: Simakin - Gamified Al-Quran Memorization Platform
- **Tech Stack**: React Router v7, Prisma, MySQL, Google Gemini AI
- **Current Status**: ~62% complete (Core recitation flow working)

---

## Phase 1: MVP - Essential Features (NOW)

### Milestone 1 — Project Setup & Schema Definition
**Status**: ✅ COMPLETE (100%)

| Deliverable | Status |
|-------------|--------|
| Initialize Remix project (React Router v7) | ✅ |
| Configure TypeScript, ESLint, Prettier | ✅ |
| Environment variables setup | ✅ |
| Prisma + MySQL connection | ✅ |
| Define main Prisma schema | ✅ |
| Auth scaffolding | ✅ |
| Basic UI layout | ✅ |

---

### Milestone 2 — Authentication & Onboarding
**Status**: ⚠️ COMPLETE (~70%)

| Deliverable | Status |
|-------------|--------|
| Email/Password login | ✅ |
| Google OAuth | ✅ |
| Onboarding flow | ✅ |
| Dashboard placeholder | ✅ |
| Protect routes | ✅ |

**Minor item to fix:**
- Add option to input total memorized juz in onboarding (original spec)

---

### Milestone 3 — Core Feature: Simak (Ziyadah / Muroja'ah Flow)
**Status**: ✅ COMPLETE (~95%)

| Deliverable | Status |
|-------------|--------|
| UI for Ziyadah/Muroja'ah selection | ✅ |
| Input form for surah and ayah range | ✅ |
| Audio recording & upload | ✅ |
| Send audio → Gemini for transcription | ✅ |
| Send transcript + metadata → Gemini for analysis | ✅ |
| Display AI feedback | ✅ |
| Add EXP system | ✅ |
| Store recitation + feedback to DB | ✅ |

**Note**: This is better than originally planned (3 scores, comprehensive tajweed)

---

### Milestone 4 — Progress Report & XP System
**Status**: ⚠️ PARTIALLY COMPLETE (~60%)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Daily/Weekly progress charts | ⚠️ | Exists, needs verification |
| XP History tracking | ❌ | **NEEDS IMPLEMENTATION** |
| Evaluation summary | ⚠️ | Partially done |
| Connect Dashboard to show summary stats | ✅ | Done |

#### Action Items (NOW):
- [ ] Create XPHistory model in Prisma
- [ ] Track every XP gain with timestamp
- [ ] Build proper daily/weekly/monthly charts

---

### Milestone 5 — Minigame & Leaderboard
**Status**: ⚠️ PARTIALLY COMPLETE (~50%)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Minigame: "Guess the Ayah" | ❌ | **NEEDS IMPLEMENTATION** |
| EXP gain for minigames | ❌ | Depends on minigame |
| Leaderboard page | ⚠️ | Route exists, needs verification |
| Sync leaderboard with XP system | ⚠️ | Needs verification |

#### Action Items (NOW):
- [ ] Build "Guess the Ayah" minigame
- [ ] Add EXP rewards for playing
- [ ] Verify leaderboard sync works

---

### Milestone 6 — Polish, Testing, and Admin Prep
**Status**: ❌ NOT STARTED (0%)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Refine UI for mobile & desktop | ⚠️ | Partial done |
| Settings page | ❌ | **NEEDS IMPLEMENTATION** |
| Integration tests | ❌ | **NEEDS IMPLEMENTATION** |
| Logging & error tracking | ❌ | **NEEDS IMPLEMENTATION** |
| Admin route placeholders | ❌ | **NEEDS IMPLEMENTATION** |

#### Action Items (NOW):
- [ ] Create Settings page (language, timezone, account)
- [ ] Add Sentry for error tracking
- [ ] Write integration tests for recitation flow
- [ ] Create admin route placeholders

---

## Phase 2: Future Enhancements (LATER - v1.1+)

These are suggestions that add value but aren't critical for MVP:

### High Priority (v1.1)
- [ ] Dark/Light mode toggle (schema already supports `theme`)
- [ ] Export progress as PDF
- [ ] Daily reminder notifications
- [ ] Surah progress visualization (visual map of memorized surahs)
- [ ] Improved onboarding (add juz input)

### Medium Priority (v1.2)
- [ ] Streaming audio upload for long recitations
- [ ] Social features: share results to social media
- [ ] More minigames (beyond "Guess the Ayah")
- [ ] Achievement system (badges display)
- [ ] Weekly/monthly leaderboard categories

### Lower Priority (v1.3+)
- [ ] Community features: peer review, mentor system
- [ ] Advanced tajwid detection (beyond current)
- [ ] Real-time feedback streaming
- [ ] Admin dashboard (analytics, user management)
- [ ] Custom practice mode (select specific ayah for drilling)

---

## Implementation Priority

### Immediate (This Sprint)
1. XPHistory model + tracking
2. Settings page
3. Minigame implementation

### Next (Next 2 Sprints)
4. Leaderboard verification + sync
5. Dark mode toggle
6. Error tracking (Sentry)

### Later (v1.1+)
7. All "Future Enhancements" items

---

## Summary

| Phase | Focus | Estimated Items |
|-------|-------|-----------------|
| Phase 1 (NOW) | MVP completion | ~10 items |
| Phase 2 (v1.1+) | Enhancements | ~15+ items |

**Current**: 62% complete
**To MVP**: +25% (XPHistory, Minigame, Settings, Tests)
**After MVP**: Full feature set via Phase 2

---

*Generated: 2026-03-15*