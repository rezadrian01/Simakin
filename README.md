# Simakin - Smart Al-Quran Learning Platform

<div align="center">

![Simakin Logo](./public/favicon.ico)

**Simakin** is an intelligent Al-Quran learning platform that uses AI technology to help users memorize and improve their Quran recitation.

[![React Router](https://img.shields.io/badge/React_Router-v7-blue.svg)](https://reactrouter.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-green.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-blue.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

## Table of Contents

- [Features](#features)
  - [Core Features](#core-features)
  - [Technical Features](#technical-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Commands](#development-commands)
- [Docker Deployment](#docker-deployment)
  - [Development](#development)
  - [Production](#production)
  - [Cloud Deployment](#cloud-deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
  - [Contribution Guidelines](#contribution-guidelines)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Message Convention](#commit-message-convention)
  - [Pull Request Guidelines](#pull-request-guidelines)
  - [Issue Guidelines](#issue-guidelines)
  - [Labels Convention](#labels-convention)
  - [Code Review Process](#code-review-process)
  - [Testing Requirements](#testing-requirements)
  - [Documentation Requirements](#documentation-requirements)
  - [Development Workflow](#development-workflow)
  - [Code Style Guidelines](#code-style-guidelines)
- [Security](#security)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support](#support)

## Features

### Core Features

- **Audio Recitation Analysis** - AI-powered feedback for Quran recitation
- **Memorization Tracking** - Juz-based memorization system with visual progress
- **Tajweed Correction** - Real-time tajweed analysis and correction
- **Performance Analytics** - Detailed analysis of accuracy, fluency, and tajweed scores
- **Gamification System** - Achievement badges and competitive leaderboards
- **Social Learning** - Community features for sharing progress

### Technical Features

- **Server-side Rendering** - Optimized performance with SSR
- **Hot Module Replacement** - Fast development experience
- **Asset Optimization** - Bundle optimization and lazy loading
- **TypeScript** - Type safety for robust development
- **Modern UI/UX** - Responsive design with TailwindCSS
- **Google OAuth** - Secure authentication system
- **Docker Ready** - Containerized for easy deployment

## Tech Stack

| Category           | Technology                            |
| ------------------ | ------------------------------------- |
| **Frontend**       | React 19, React Router v7, TypeScript |
| **Styling**        | TailwindCSS v4, CSS Modules           |
| **Backend**        | Node.js, React Router SSR             |
| **Database**       | MySQL, Prisma ORM                     |
| **Authentication** | Google OAuth 2.0                      |
| **Build Tools**    | Vite, pnpm                            |
| **Deployment**     | Docker, Multi-stage builds            |
| **Dev Tools**      | ESLint, Prettier, TypeScript          |

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 8.x
- **MySQL** >= 8.x
- **Git**

### Installation

1. **Clone repository**

   ```bash
   git clone https://github.com/rezadrian01/Simakin.git
   cd Simakin
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/simakin_db"
   SESSION_SECRET="your-super-secret-session-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:5173/auth/google/callback"
   ```

4. **Setup database**

   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run migrations
   pnpm prisma migrate deploy

   # (Optional) Seed database
   pnpm prisma db seed
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

   Application will be available at `http://localhost:5173`

### Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm typecheck        # Type checking
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database
pnpm prisma studio    # Open Prisma Studio
pnpm prisma migrate   # Create new migration
pnpm prisma reset     # Reset database

# Build & Deploy
pnpm build            # Production build
pnpm start            # Start production server
pnpm preview          # Preview production build
```

## Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
# Build image
docker build -t simakin .

# Run container
docker run -p 3000:3000
  -e DATABASE_URL="your-db-url"
  -e SESSION_SECRET="your-secret"
  simakin
```

### Cloud Deployment

Supported platforms:

- **AWS ECS/EKS**
- **Google Cloud Run**
- **Azure Container Apps**
- **Digital Ocean App Platform**
- **Fly.io**
- **Railway**
- **Vercel** (with adaptations)

## Project Structure

```
Simakin/
├── app/                          # React Router application
│   ├── routes/                   # Page routes & loaders
│   │   ├── home.tsx             # Landing page
│   │   ├── auth/                # Authentication routes
│   │   ├── dashboard/           # User dashboard
│   │   ├── recitation/          # Recitation features
│   │   └── profile/             # User profile
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   └── layout/              # Layout components
│   ├── lib/                     # Utility libraries
│   │   ├── db.server.ts         # Database connection
│   │   ├── auth.server.ts       # Authentication logic
│   │   ├── utils.ts             # General utilities
│   │   └── validations.ts       # Form validations
│   ├── styles/                  # Global styles
│   ├── types/                   # TypeScript type definitions
│   └── root.tsx                 # Root component
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Migration files
│   └── seed.ts                  # Database seeding
├── public/                      # Static assets
├── docs/                        # Documentation
├── tests/                       # Test files
│   ├── __tests__/              # Unit tests
│   ├── e2e/                    # End-to-end tests
│   └── fixtures/               # Test fixtures
├── .github/                     # GitHub workflows
├── docker/                      # Docker configurations
└── scripts/                     # Build & deployment scripts
```

## 🤝 Contributing

We welcome contributions from developers of all levels! Please read the following guidelines before contributing.

### 📋 Contribution Guidelines

#### 🌿 Branch Naming Convention

| Type         | Format                    | Example                 | Description           |
| ------------ | ------------------------- | ----------------------- | --------------------- |
| **Feature**  | `feat/feature-name`       | `feat/audio-upload`     | New features          |
| **Bugfix**   | `fix/bug-description`     | `fix/login-redirect`    | Bug fixes             |
| **Hotfix**   | `hotfix/critical-issue`   | `hotfix/security-patch` | Critical fixes        |
| **Chore**    | `chore/task-description`  | `chore/update-deps`     | Maintenance tasks     |
| **Docs**     | `docs/documentation-type` | `docs/api-reference`    | Documentation updates |
| **Refactor** | `refactor/component-name` | `refactor/auth-logic`   | Code refactoring      |
| **Test**     | `test/test-type`          | `test/unit-auth`        | Adding tests          |
| **Style**    | `style/ui-component`      | `style/button-design`   | UI/Style changes      |

#### Commit Message Convention

Gunakan format **Conventional Commits**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

**Examples:**

```bash
feat(auth): add Google OAuth integration
fix(recitation): resolve audio upload timeout issue
docs(api): update authentication endpoints documentation
style(ui): improve responsive design for mobile devices
refactor(database): optimize user queries for better performance
test(recitation): add unit tests for audio analysis
chore(deps): update React Router to v7.9.2
```

#### Pull Request Guidelines

**PR Title Format:**

```
[TYPE] Brief description of changes
```

**Examples:**

- `[FEAT] Add audio recitation analysis feature`
- `[FIX] Resolve login redirect loop issue`
- `[DOCS] Update installation guide`

**PR Description Template:**

```markdown
## 📝 Description

Brief description of changes made.

## 🎯 Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## ✅ Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## 📸 Screenshots (if applicable)

Add screenshots here for UI changes.

## 🔗 Related Issues

Closes #issue_number
Relates to #issue_number

## ✅ Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

#### Issue Guidelines

**Issue Title Format:**

```
[TYPE] Brief description of the issue
```

**Types:**

- `[BUG]` - Bug reports
- `[FEAT]` - Feature requests
- `[DOCS]` - Documentation issues
- `[PERF]` - Performance issues
- `[SECURITY]` - Security concerns

**Bug Report Template:**

```markdown
## 🐛 Bug Description

Clear and concise description of the bug.

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## ✅ Expected Behavior

What you expected to happen.

## ❌ Actual Behavior

What actually happened.

## 🖼 Screenshots

Add screenshots if applicable.

## 🌐 Environment

- OS: [e.g., Windows 10, macOS 12.1, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 95, Safari 15]
- Node.js version: [e.g., 18.12.0]
- App version: [e.g., 1.2.3]

## 📋 Additional Context

Add any other context about the problem here.
```

**Feature Request Template:**

```markdown
## 🚀 Feature Description

Clear and concise description of the feature you'd like to see.

## 💡 Motivation

Why is this feature needed? What problem does it solve?

## 📝 Detailed Description

Detailed description of how the feature should work.

## 🎯 Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## 🖼 Mockups/Examples

Add mockups, examples, or similar implementations if available.

## 🔧 Implementation Ideas

Any ideas on how this could be implemented (optional).

## 📊 Priority

- [ ] Low
- [ ] Medium
- [ ] High
- [ ] Critical
```

#### Labels Convention

**Priority Labels:**

- `priority/critical` - Critical issues requiring immediate attention
- `priority/high` - High priority issues
- `priority/medium` - Medium priority issues
- `priority/low` - Low priority issues

**Type Labels:**

- `type/bug` - Bug reports
- `type/feature` - New features
- `type/enhancement` - Improvements to existing features
- `type/documentation` - Documentation related
- `type/performance` - Performance improvements
- `type/security` - Security related issues

**Status Labels:**

- `status/triage` - Needs initial review
- `status/in-progress` - Currently being worked on
- `status/review` - Ready for review
- `status/blocked` - Blocked by external dependencies
- `status/wontfix` - Won't be implemented

**Component Labels:**

- `component/auth` - Authentication related
- `component/ui` - User interface
- `component/api` - API related
- `component/database` - Database related
- `component/recitation` - Recitation features

#### Code Review Process

1. **Self Review** - Review your own PR first
2. **Automated Checks** - Ensure all CI checks pass
3. **Peer Review** - At least 1 approval from team member
4. **Testing** - Manual testing if needed
5. **Merge** - Squash and merge after approval

#### Testing Requirements

- **Unit Tests** - Required for new functions/components
- **Integration Tests** - Required for API endpoints
- **E2E Tests** - Required for critical user flows
- **Manual Testing** - Required for UI changes

#### Documentation Requirements

- **Code Comments** - For complex logic
- **README Updates** - For new features
- **API Documentation** - For new endpoints
- **Changelog** - For version releases

### Development Workflow

1. **Fork & Clone**

   ```bash
   # Fork the repo on GitHub
   git clone https://github.com/rezadrian01/Simakin.git
   cd Simakin
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make Changes**

   - Write code following our style guide
   - Add tests for new functionality
   - Update documentation if needed

4. **Test Your Changes**

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

5. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

6. **Push & Create PR**

   ```bash
   git push origin feat/your-feature-name
   # Create PR on GitHub
   ```

### Code Style Guidelines

#### **TypeScript/JavaScript**

- Use **TypeScript** for all new files
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Prefer **const assertions** and **type guards**
- Use **descriptive variable names**

#### **React Components**

```tsx
// ✅ Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  // Component logic here
}

// ❌ Bad
export function UserProfile(props: any) {
  // Component logic here
}
```

Note: While component functions use PascalCase, the file names should use kebab-case (e.g., `user-profile.tsx`).

#### **File Naming**

- **Components**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `dateUtils.ts`)
- **Types**: `camelCase.types.ts` (e.g., `user.types.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`

#### **Import Organization**

```tsx
// 1. React and React Router imports
import { useState, useEffect } from "react";
import { useLoaderData, Form } from "react-router";

// 2. External libraries
import clsx from "clsx";
import { z } from "zod";

// 3. Internal utilities
import { db } from "~/lib/db.server";
import { requireAuth } from "~/lib/auth.server";

// 4. Internal components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

// 5. Types
import type { User } from "~/types/user.types";
```

## Security

If you discover a security vulnerability, please don't create a public issue. Please email: **security@simakin.app**

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgments

- **Al-Quran API** - For mushaf data and translations
- **Google Cloud Speech-to-Text** - For speech recognition
- **Open Source Community** - For various libraries used
- **Contributors** - Everyone who has contributed to this project

## Support

- **Documentation**: [docs.simakin.app](https://docs.simakin.app)
- **Issues**: [GitHub Issues](https://github.com/rezadrian01/Simakin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rezadrian01/Simakin/discussions)
- **Email**: [support@simakin.app](mailto:support@simakin.app)

---

<div align="center">

**Built with ❤️ for the Muslim Ummah**

[Website](https://simakin.app) • [Documentation](https://docs.simakin.app) • [API](https://api.simakin.app) • [Community](https://community.simakin.app)

</div>
