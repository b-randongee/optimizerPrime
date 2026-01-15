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

### External JSON Configuration for Constants
**Problem**: Need to manage 40+ cost values that change frequently, without cluttering component code or rebuilding UI for edits.

**Solution**: Extract configuration data to external JSON file in `src/` directory, import directly into React components.

**Structure**:
```javascript
// src/costs.json
{
  "demolitionComponents": [ /* array of objects with costs arrays */ ],
  "interiorComponents": [ /* array of objects with costs arrays */ ],
  "restroomComponent": { /* single object with costs array */ },
  "exteriorComponent": { /* single object with costs array */ }
}

// src/App.jsx
import costsData from "./costs.json";
const COMPONENTS = costsData.interiorComponents;
```

**When to Use**:
- Configuration data with 10+ values
- Values that change independently from logic
- Data that needs to be edited via terminal/editor (not UI)
- Constants that benefit from version control tracking

**When NOT to Use**:
- Sensitive data (use environment variables)
- Computed values (keep in component logic)
- User-specific data (use state/database)
- Values that require validation before use

**Benefits**:
- ✅ Hot-reload in development (Vite auto-detects JSON changes)
- ✅ Version controlled (git tracks all changes)
- ✅ Terminal-editable (nano, vim, VS Code, sed, jq)
- ✅ No UI maintenance required
- ✅ Easy bulk updates

**Example**:
```bash
# Edit costs directly via terminal
nano src/costs.json

# Or with jq for programmatic updates
jq '.interiorComponents[0].costs[1] = 8' src/costs.json > tmp.json && mv tmp.json src/costs.json
```

**Status**: ✅ Established in costs.json (2026-01-15)

**Related**: See ADR-004 for decision rationale

---

## Anti-Patterns (Don't Do These)

- ❌ [Add as you discover them]

---

## Pattern Change Log

| Date | Pattern | Change | Reason |
|------|---------|--------|--------|
| 2026-01-15 | Initial setup | Created patterns doc | Project initialization |
