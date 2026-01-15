# Patterns — optimizerPrime

> **Purpose**: Document working patterns so Claude doesn't break them.
> Update this file whenever you establish a new pattern.

---

## Deployment Patterns

### GCS Static Site Deployment
```bash
# 1. ALWAYS verify GCS configuration first (CRITICAL)
gcloud config get-value project  # Must be: brandon-gee
gcloud config get-value account  # Must be: brandon.gee@trilogy.com

# 2. Build the React app
npm run build  # Outputs to dist/

# 3. Deploy to GCS bucket
gsutil -m rsync -r -d ./dist gs://optimizer-prime-dashboard

# OR use the shortcut:
npm run deploy
```
**Status**: ✅ Established and working
**Bucket**: optimizer-prime-dashboard (public access configured)
**URL**: https://storage.googleapis.com/optimizer-prime-dashboard/index.html

---

## React Patterns

### Vite + React + Tailwind Setup
```bash
# Project uses Vite for fast builds and dev experience
npm run dev      # Dev server with HMR at localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```
**Dependencies**:
- React 18 (react, react-dom)
- Tailwind CSS 3 (with PostCSS, Autoprefixer)
- framer-motion (animations)
- recharts (data visualization)
- lucide-react (icon library)

**Status**: ✅ Established

### Single Component Architecture
The app is currently a single-file component (`src/App.jsx`) with:
- Local state management (useState)
- Memoized calculations (useMemo)
- No routing (single page application)
- Self-contained component definitions

**Status**: ✅ Working, may refactor if complexity grows

---

## Data Patterns

### [Pattern Name]
```
[To be documented]
```

---

## Anti-Patterns (Don't Do These)

- ❌ [Add as you discover them]

---

## Pattern Change Log

| Date | Pattern | Change | Reason |
|------|---------|--------|--------|
| 2026-01-15 | Initial setup | Created patterns doc | Project initialization |
