# GADvance (learner web app)

GADvance is an adaptive e-learning platform for gender sensitivity and Gender and
Development (GAD) education. Learners take structured courses made of modules and
lessons, and checkpoint quizzes adapt their difficulty using Bayesian Knowledge
Tracing (BKT).

This repository is the learner-facing web app and public website. It works with:

| Repository | Role |
|---|---|
| `gadvance` (this repo) | Learner app and public site: sign-up, onboarding, courses, lessons, assessments, documentation |
| `gadvance-portal` | Admin Portal for organization admins and Super Admins |
| `gadvance-api` | Laravel API: authentication, BKT engine, data storage, transactional email |

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- NextAuth for sessions (email/password through the API, and Google sign-in)
- TanStack Query for data fetching
- Jest for unit tests

## Features

- Email/password and Google sign-up, email verification, password reset
- Profile onboarding
- Organizations joined with a 6-digit code or invitation link
- Course (learning plan) browsing and enrollment
- Lessons, pre-tests, post-tests, and BKT-driven adaptive checkpoint quizzes
- Remedial review suggestions and per-topic mastery estimates
- Certificates with public verification codes
- Learner documentation at `/docs`

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm test
npm run build
```

Configuration is read from environment variables such as `NEXT_PUBLIC_API_URL`,
`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and the Google OAuth client settings. Keep real
values out of the repository.

The API only accepts browser requests from its configured CORS origins
(`http://localhost:3000` and `http://localhost:3001` in development).

## Documentation

Learner guides live in `app/(public)/docs`:

- `_lib/registry.ts` lists every article (navigation, search, related links)
- `_content/` holds the article bodies
- `_components/diagrams.tsx` holds the SVG diagrams
- `_lib/bkt.ts` mirrors the API's BKT update so examples are computed; a unit test
  keeps it in sync with `gadvance-api`

Screenshots in `_assets/` were captured from a local build using synthetic demo
data only.

## Support

projectgadvance@gmail.com

## SDG alignment

- SDG 4: Quality Education
- SDG 5: Gender Equality

Developed by student researchers of the College of Computer Studies, Laguna State
Polytechnic University – San Pablo City Campus.
