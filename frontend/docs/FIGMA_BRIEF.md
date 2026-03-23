# Figma Brief

## Pages
- `00_Brief`
- `01_Foundations`
- `02_Components`
- `03_Leaderboard`
- `04_Project`
- `05_Market`

## Visual Direction
- Trustworthy data product
- Korean-first information service
- Dense but calm dashboards over startup-style landing pages

## Handoff Contract
- Target frame
- Applied tokens
- Responsive rules
- Existing code component mapping
- Acceptance criteria

## Current Code Mapping
- Foundations: `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`
- Shared shell: `frontend/src/components/layout/*`, `frontend/src/components/ui/*`
- Leaderboard: `frontend/src/app/[locale]/page.tsx`, `frontend/src/app/[locale]/ranking/page.tsx`
- Project: `frontend/src/app/[locale]/projects/[slug]/page.tsx`, `frontend/src/components/project/*`
- Market: `frontend/src/app/[locale]/market/*`, `frontend/src/components/prediction/*`
