# Figma Attachment Brief

## Product
- Product name: OSS 리더보드
- Type: Korean-first web product for evaluating open source projects
- Core idea: rank projects using multiple signals, not just GitHub stars
- Core axes: 관심도, 실행력, 건강도, 신뢰도

## Audience
- Primary audience: Korean users exploring OSS trends, project quality, and comparisons
- Product tone: trustworthy, analytical, calm, information-dense

## Design Direction
- Build this as a data product, not a marketing landing page
- Prioritize Korean readability, strong hierarchy, and clear table/card/chart relationships
- Avoid flashy startup visuals, purple-heavy palettes, neon gradients, or overly playful styles
- Prefer a white, soft-blue, slate-based visual system with disciplined accent colors

## Main Screens
- Home
- Global rankings
- CNCF leaderboard
- Rising projects
- Project detail
- Project comparison
- Categories
- Scoring guide
- Prediction market
- Season ranking
- Top predictors
- My positions
- Badges

## Required Foundations
- Color tokens
- Typography scale
- Spacing scale
- Radius and shadow tokens
- Chart palette
- State colors
- Desktop-first responsive rules for 1440px

## Required Components
- Header
- Footer
- Page header
- Panel / card
- Stat card
- Score badge
- Score bar
- Leaderboard table
- Chart card
- Explanation panel
- Prediction card
- Empty / loading / error state

## Priority
1. Foundations
2. Components
3. High-fidelity MVP screens
4. Extension screens using the same system

## MVP Priority Screens
- Home
- Global rankings
- Project detail
- Compare
- Rising

## Implementation Constraints
- Must be component-friendly and easy to map to code
- Must support desktop first, then tablet/mobile variants
- Must preserve consistency across leaderboard and market surfaces
- Korean copy should be treated as the default language

## Current Code Reference
- Foundations: `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`
- Shared components: `frontend/src/components/ui`, `frontend/src/components/layout`
- Leaderboard pages: `frontend/src/app/[locale]/page.tsx`, `frontend/src/app/[locale]/ranking/page.tsx`
- Project pages: `frontend/src/app/[locale]/projects/[slug]/page.tsx`
- Market pages: `frontend/src/app/[locale]/market`

## What To Generate First
- Foundations proposal
- Component system proposal
- Home screen high-fidelity layout
