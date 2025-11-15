# Dogan Glass Landing (Next.js + Tailwind)

A production-ready landing page with:
- Glass-morphism hero
- Under-glass animated **agents** (Canvas)
- **Daily scene rotation** (auto gradient + accent color)
- **Live Dashboard Preview** (no external chart libs)
- **Bilingual AR/EN** with RTL support + persistent toggle
- Modern dark aesthetic
- Footer strap: *Vision & Execution — DoganConsult* (no email)

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

> Requires Node.js **>= 18.17**

## Where to Edit

- `lib/scene.ts` — add/adjust daily scenes
- `lib/i18n.ts` — edit Arabic/English strings
- `components/AgentsField.tsx` — agent animation
- `components/DashboardPreview.tsx` — KPI cards + spark bars
- `components/GlassHero.tsx` — hero, CTAs, sections
- `components/FooterStrap.tsx` — footer strap (keeps only the URL)

## Deploy

- Build: `npm run build`
- Start: `npm start` (uses Next standalone output)
- Containerize: add a Dockerfile or use Azure Container Apps with your existing pipeline.
