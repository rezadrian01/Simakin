# AI System Instructions for Simakin Project

## Project Overview

**Simakin** is a web application designed to help users memorize the Qur'an through gamification. This project uses React Router v7, Prisma ORM, MySQL, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: React Router v7 (SSR)
- **Database**: MySQL with Prisma ORM
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **Language**: TypeScript (strict mode)
- **Icons**: Lucide React
- **API Integration**: AlQuran Cloud API
- **Deployment**: (TBD)

## Project Structure

```
app/
├── routes/                    # React Router routes
│   ├── home.tsx              # Landing page
│   ├── auth/                 # Authentication routes
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── signout/
│   │   └── google/callback/
│   └── app/                  # Protected app routes
│       ├── app-layout.tsx    # Main layout with sidebar
│       ├── dashboard/        # Dashboard overview
│       ├── onboarding/       # First-time user onboarding
│       ├── memorization/     # Memorization management
│       ├── game/             # Gamification features
│       ├── leaderboard/      # User rankings
│       └── progress-report/  # Statistics & reports
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── app-sidebar.tsx       # App navigation sidebar
├── lib/
│   ├── db.server.ts          # Prisma client
│   ├── utils.ts              # Utility functions
│   ├── constant.ts           # App constants
│   └── quran-page-mapping.ts # AlQuran Cloud API integration
├── services/                 # Business logic layer
│   ├── auth/
│   │   └── auth.server.ts    # Authentication logic
│   ├── memorization/
│   │   └── memorization.server.ts  # Memorization CRUD
│   ├── exp/
│   │   └── exp.server.ts     # EXP calculation
│   └── streak/
│       └── streak.server.ts  # Streak tracking
└── hooks/
    └── use-mobile.ts         # Responsive hooks

prisma/
└── schema.prisma             # Database schema

docs/
├── AI_SYSTEM_INSTRUCTIONS.md # This file (for AI reference)
├── ONBOARDING_SYSTEM.md      # Onboarding documentation
├── MEMORIZATION_TRACKING.md  # Memorization system
├── EXP_SYSTEM.md             # Gamification & EXP
├── STREAK_IMPLEMENTATION.md  # Streak tracking
└── QUICK_START.md            # Development guide
```

## Core Features

### 1. Authentication System

- **Google OAuth** (primary method)
- **Email/Password** (alternative)
- Protected routes with `requireUserId()`
- Session-based authentication
- Auto-redirect after login

**Key Files**:

- `app/services/auth/auth.server.ts` - Auth logic
- `app/routes/auth/*` - Auth routes
- See: `docs/AUTH_CROSS_METHOD_ANALYSIS.md`

### 2. Onboarding System

- **Mandatory**: Users must complete on first login
- **Referral Source**: Track how users found the app (13 options + "Other")
- **Page Ranges**: Optional input for existing memorization
- **AlQuran Cloud API**: 100% accurate page-to-surah conversion
- **No Skip**: Must select referral source to proceed

**Key Files**:

- `app/routes/app/onboarding/index.tsx` - UI & logic
- `app/lib/quran-page-mapping.ts` - API integration
- `app/services/memorization/memorization.server.ts` - Save logic
- See: `docs/ONBOARDING_SYSTEM.md`

### 3. Memorization Tracking

- **Three Types**:
  - `ONBOARDING` - Initial memorization
  - `ZIYADAH` - New memorization
  - `MURAJA'AH` - Review session
- **Database**: `UserMemorization` model
- **Surah-based**: Track by surah number + ayah range
- **Status**: COMPLETED, IN_PROGRESS, etc.

**Key Files**:

- `app/services/memorization/memorization.server.ts`
- See: `docs/MEMORIZATION_TRACKING.md`

### 4. EXP & Gamification System

- **Base EXP**: 10 per ayah
- **Multipliers**: Consecutive days, perfect sessions, etc.
- **Levels**: Progressive leveling system
- **Ranks**: Bronze → Silver → Gold → Platinum → Diamond

**Key Files**:

- `app/services/exp/exp.server.ts`
- See: `docs/EXP_SYSTEM.md`

### 5. Streak Tracking

- **Daily Streak**: Consecutive days with activity
- **Freeze**: Protect streak with items
- **Reset Logic**: Automatic at midnight

**Key Files**:

- `app/services/streak/streak.server.ts`
- See: `docs/STREAK_IMPLEMENTATION.md`

## Database Schema (Key Models)

### User

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  googleId      String?  @unique

  profile       UserProfile?
  memorizations UserMemorization[]
  sessions      Session[]
}
```

### UserProfile

```prisma
model UserProfile {
  id              String          @id @default(cuid())
  userId          String          @unique

  // Onboarding data
  referralSource  ReferralSource? // INSTAGRAM, TIKTOK, etc.
  referralOther   String?

  // Gamification
  exp             Int             @default(0)
  level           Int             @default(1)
  rank            UserRank        @default(BRONZE)

  // Streak
  currentStreak   Int             @default(0)
  longestStreak   Int             @default(0)
  lastActivityAt  DateTime?

  user User @relation(fields: [userId], references: [id])
}
```

### UserMemorization

```prisma
model UserMemorization {
  id          String   @id @default(cuid())
  userId      String

  // Qur'an location
  surah       Int      // 1-114
  startAyah   Int
  endAyah     Int

  // Metadata
  source      MemorizationSource  // ONBOARDING | ZIYADAH | MURAJA'AH
  status      MemorizationStatus  // COMPLETED | IN_PROGRESS | FAILED
  completedAt DateTime?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, surah, startAyah, endAyah])
}
```

### Key Enums

```prisma
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

enum MemorizationSource {
  ONBOARDING   // From initial setup
  ZIYADAH      // New memorization session
  MURAJA_AH    // Review session
}

enum MemorizationStatus {
  COMPLETED
  IN_PROGRESS
  FAILED
}

enum UserRank {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}
```

## AlQuran Cloud API Integration

**Base URL**: `https://api.alquran.cloud/v1`

**Endpoints Used**:

```
GET /page/{pageNumber}/quran-uthmani   # Get page data
GET /surah                              # Get all 114 surahs metadata
```

**Usage**: Convert page ranges (e.g., "1-201") to structured surah/ayah data

**Performance**:

- 3 API calls total (2 page + 1 surah batch)
- ~300-500ms average
- 100% accuracy vs ~60% with AI

**Key Functions**:

```typescript
// In app/lib/quran-page-mapping.ts
parsePageRanges(pageRanges: string[]): Promise<ParsedResult>
```

## Coding Standards

### File Naming

- **Routes**: kebab-case (`onboarding/index.tsx`)
- **Components**: kebab-case (`app-sidebar.tsx`)
- **Services**: kebab-case (`auth.server.ts`)
- **Utils**: kebab-case (`use-mobile.ts`)

### Code Style

- **TypeScript**: Strict mode, no `any`
- **Imports**: Organize by source (React → Router → UI → Local)
- **Functions**: Descriptive names, JSDoc for complex logic
- **Error Handling**: Try-catch with proper logging
- **Logging**: Use prefixes `[SERVICE]` e.g., `[ONBOARD]`, `[PARSE]`, `[EXP]`

### React Router v7 Patterns

**Route File Structure**:

```typescript
import type { Route } from "./+types/index";

// Loader (server-side data fetching)
export async function loader({ request }: Route.LoaderArgs) {
  // Fetch data
  return { data };
}

// Action (form submission handler)
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Process form
  return redirect("/success");
}

// Component (UI)
export default function MyPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <div>...</div>;
}
```

**Type-Safe Routing**:

```typescript
// Use Route.LoaderArgs and Route.ActionArgs
// Use useLoaderData<typeof loader>()
// Use useActionData<typeof action>()
```

### UI Component Usage

**shadcn/ui Components**:

```typescript
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
// etc.
```

**Tailwind CSS v4**:

- Use utility classes
- Responsive: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode: `dark:` prefix
- Custom colors: `bg-simakin-primary`, `text-simakin-primary`

### Validation Patterns

**Client-Side**:

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (value: string) => {
  const newErrors = { ...errors };
  if (!value) {
    newErrors['field'] = 'Field required';
  }
  setErrors(newErrors);
};

// Disable submit if has errors
<Button disabled={Object.keys(errors).length > 0}>
```

**Server-Side**:

```typescript
if (!value) {
  return json({ success: false, error: "Field required" }, { status: 400 });
}
```

## Common Patterns

### Authentication Check

```typescript
import { requireUserId } from "~/services/auth/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  // User is authenticated, proceed
}
```

### Database Queries

```typescript
import { db } from "~/lib/db.server";

// Find user
const user = await db.user.findUnique({
  where: { id: userId },
  include: { profile: true },
});

// Create record
const memorization = await db.userMemorization.create({
  data: {
    userId,
    surah: 1,
    startAyah: 1,
    endAyah: 7,
    source: "ONBOARDING",
    status: "COMPLETED",
  },
});
```

### Form Handling

```typescript
export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const field = formData.get('field') as string;

  // Validate
  if (!field) {
    return json({ success: false, error: 'Required' });
  }

  // Process
  await db.model.create({ data: { ... } });

  // Redirect on success
  return redirect('/success');
}
```

### Error Logging

```typescript
try {
  // Operation
} catch (error) {
  console.error("[SERVICE] Error message:", error);
  return json(
    { success: false, error: "User-friendly message" },
    { status: 500 }
  );
}
```

## Important Considerations

### 1. Onboarding System

- ✅ **MUST**: Users select referral source (no skip)
- ✅ **OPTIONAL**: Page ranges can be empty
- ✅ **VALIDATION**: Real-time with clear error messages
- ✅ **API**: Use AlQuran Cloud, not Gemini AI
- ✅ **ONE-TIME**: Auto-redirect if already completed

### 2. Page Range Parsing

- ✅ Input format: "1-201, 542-604" (comma-separated)
- ✅ Use `parsePageRanges()` from `quran-page-mapping.ts`
- ✅ Handle discontinuous ranges (gaps detected automatically)
- ✅ Returns structured data: `{memorizations: [], summary: {...}}`
- ❌ NO Gemini AI (removed, use API only)

### 3. Database Operations

- ✅ Use Prisma client: `db` from `~/lib/db.server`
- ✅ Add `.server.ts` suffix for server-only code
- ✅ Use transactions for related operations
- ✅ Handle unique constraint violations
- ✅ Use proper relations and includes

### 4. UI/UX Guidelines

- ✅ Mobile-first responsive design
- ✅ Touch targets: min 44px (h-11 or h-12)
- ✅ Clear labels and placeholders
- ✅ Real-time validation feedback
- ✅ Loading states with spinners
- ✅ Error messages with icons
- ✅ Consistent color coding (blue=info, amber=warning, red=error)

### 5. Performance

- ✅ Minimize API calls (batch when possible)
- ✅ Use parallel requests when no dependencies
- ✅ Client-side validation before server
- ✅ Optimize database queries (select specific fields)
- ✅ Cache static data when appropriate

## Development Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Type checking
pnpm typecheck

# Database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio

# Build for production
pnpm build
```

## When Working on Features

### Before Making Changes

1. **Read relevant docs** in `/docs` folder
2. **Check existing patterns** in similar files
3. **Understand database schema** in `prisma/schema.prisma`
4. **Review related services** in `app/services/`

### While Coding

1. **Follow TypeScript strict mode** (no `any`, proper types)
2. **Use existing components** from `~/components/ui`
3. **Add proper error handling** with try-catch
4. **Log operations** with service prefixes
5. **Validate inputs** both client and server side

### After Changes

1. **Test manually** in browser
2. **Check TypeScript errors** (`pnpm typecheck`)
3. **Verify database changes** (migrations if needed)
4. **Update documentation** if adding new features
5. **Test error cases** and edge cases

## Common Pitfalls to Avoid

❌ **DON'T**:

- Use Gemini AI for page parsing (use AlQuran Cloud API)
- Skip validation on server-side
- Use `any` type in TypeScript
- Make database queries in components (use loader/action)
- Hardcode values (use constants)
- Forget to handle loading states
- Ignore error cases
- Use inline styles (use Tailwind)

✅ **DO**:

- Use AlQuran Cloud API for Qur'an data
- Validate on both client and server
- Use proper TypeScript types
- Keep business logic in services
- Use constants from `~/lib/constant.ts`
- Show loading spinners for async operations
- Handle all error scenarios
- Use Tailwind utility classes

## Quick Reference Links

- **Onboarding**: `docs/ONBOARDING_SYSTEM.md`
- **Memorization**: `docs/MEMORIZATION_TRACKING.md`
- **EXP System**: `docs/EXP_SYSTEM.md`
- **Streak**: `docs/STREAK_IMPLEMENTATION.md`
- **Auth**: `docs/AUTH_CROSS_METHOD_ANALYSIS.md`
- **Database Schema**: `prisma/schema.prisma`
- **API Integration**: `app/lib/quran-page-mapping.ts`

## AI Assistant Guidelines

When assisting with this project:

1. **Always check documentation** first before suggesting solutions
2. **Follow established patterns** from existing code
3. **Use proper TypeScript** with strict typing
4. **Respect the architecture** (routes → services → database)
5. **Provide working code** that follows project conventions
6. **Consider mobile UX** in all UI suggestions
7. **Think about validation** for all user inputs
8. **Remember**: AlQuran Cloud API (not Gemini) for page parsing
9. **Ask clarifying questions** if requirements unclear
10. **Reference docs** when explaining features

## Project Goals & Philosophy

**Mission**: Help Muslims memorize the Qur'an in an enjoyable and measurable way.

**Core Values**:

- 🎯 **User-Centric**: Easy to use, clear feedback, helpful guidance
- 📊 **Data-Driven**: Track progress, celebrate achievements
- 🎮 **Gamification**: Make memorization engaging and rewarding
- 🔒 **Reliable**: 100% accurate Qur'an data, stable system
- 📱 **Accessible**: Mobile-first, responsive design
- 🚀 **Fast**: Optimized performance, quick responses

---

**Last Updated**: October 29, 2025
**Version**: 1.0
**Maintainer**: Simakin Development Team
