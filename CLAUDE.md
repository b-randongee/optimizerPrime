# CLAUDE.md — Project Configuration

> This layers on top of global config at `~/.claude/CLAUDE.md`

## Project
- **Name**: optimizerPrime
- **Description**: React website hosted on Google Cloud Storage

## Tech Stack
- **Language**: JavaScript (JSX)
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Hosting**: Google Cloud Storage (static site)
- **Key Libraries**:
  - framer-motion (animations)
  - recharts (charts)
  - lucide-react (icons)

## GCS Configuration (REQUIRED if using Google Cloud)
⚠️ **CRITICAL**: Claude CANNOT run gcloud/gsutil/firebase deploy commands until verified.

- **GCS Project ID**: brandon-gee
- **GCS Account**: brandon.gee@trilogy.com
- **Environment**: prod

## Git Configuration
⚠️ **CRITICAL**: Claude CANNOT push until repo/branch is verified.

- **Expected Remote**: origin → https://github.com/b-randongee/optimizerPrime.git
- **Primary Branch**: main

## Commands
```bash
# Development
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Build production bundle to dist/
npm run preview     # Preview production build locally

# Deployment
npm run deploy      # Build and deploy to GCS bucket
# OR manually:
npm run build && gsutil -m rsync -r -d ./dist gs://optimizer-prime-dashboard

# GCS Management
gsutil ls gs://optimizer-prime-dashboard  # List bucket contents
gsutil web get gs://optimizer-prime-dashboard  # Get website config
```

## Project Structure
```
optimizerPrime/
├── src/                       # React source code
├── public/                    # Static assets
├── build/ or dist/           # Build output (gitignored)
├── tests/
├── docs/
│   ├── api-refs/              # API documentation (fetch-first workflow)
│   │   ├── README.md          # Workflow guide
│   │   └── TEMPLATE.md        # Template for new APIs
│   ├── patterns.md
│   ├── decisions.md
│   ├── TODO.md
│   └── lessons.md
└── CLAUDE.md
```

## Deployment Information

### Live Site
- **URL**: https://storage.googleapis.com/optimizer-prime-dashboard/index.html
- **Bucket**: gs://optimizer-prime-dashboard
- **Region**: US

### Deployment Process
1. Verify GCS configuration: `gcloud config get-value project && gcloud config get-value account`
2. Build: `npm run build`
3. Deploy: `gsutil -m rsync -r -d ./dist gs://optimizer-prime-dashboard`

## Project-Specific Rules

### GCS Static Hosting Pattern
- Bucket: `optimizer-prime-dashboard` (public read access)
- Build output (dist/) syncs to GCS root
- Website config: main page = index.html, 404 page = index.html (SPA fallback)
- All files publicly accessible via storage.googleapis.com URLs

### API Integrations in This Project
<!-- Add as you build -->

### Patterns to Follow
<!-- Add as you establish them -->

### Things NOT to Touch
<!-- Add as needed -->

## Cost Configuration Quick Reference

**File Location:** `/Users/brandon/Repos/optimizerPrime/src/costs.json`

### JSON Structure
```json
{
  "demolitionComponents": [ /* 6 components, 5 levels each */ ],
  "interiorComponents": [ /* 10 components, 4 levels each */ ],
  "restroomComponent": { /* 5 levels */ },
  "exteriorComponent": { /* 4 levels */ }
}
```

### Cost Array Format
All costs are in **dollars per square foot**:
- **Demolition**: `[None, Minor, Moderate, Extreme, Complete]` = 5 values (indices 0-4)
- **Interior**: `[As-Is, Refresh, Upgrade, Alpha]` = 4 values (indices 0-3)
- **Restroom**: `[As-Is, Demo+Basic, Demo+Alpha, Basic, Alpha]` = 5 values (indices 0-4)
- **Exterior**: `[As-Is, Refresh, Upgrade, Alpha]` = 4 values (indices 0-3)

### Demolition Components (6 items)
- **demoFloor**: Flooring removal
- **demoWalls**: Wall removal/modification
- **demoCeiling**: Ceiling removal
- **demoLighting**: Light fixture removal
- **demoHVAC**: HVAC repair/replace
- **demoCasework**: Cabinet/millwork removal

### Interior Components (10 items)
- **floors**: LVT, carpet, tile, transitions
- **walls**: Patch, paint, feature, framing
- **ceiling**: ACT, drywall, acoustics
- **lighting**: Fixtures, controls, daylighting
- **hvac**: Diffusers, VAVs, units, balancing
- **tech**: Data, AV, power, devices (applies to: learningroom, office, conferenceroom, limitlessroom, rocketroom)
- **millwork**: Storage, built-ins, counters (applies to: learningroom, office, breakroom, limitlessroom, rocketroom)
- **furniture**: Desks, chairs, tables, fixtures (applies to: learningroom, office, conferenceroom, breakroom, multipurpose)
- **appliances**: Ovens, refrigerators, dishwashers (applies to: breakroom only)
- **labequip**: Lab equipment (applies to: limitlessroom only)

### Quick Edit Examples

**Change flooring "Refresh" cost from $6 to $8:**
```bash
# In src/costs.json, find "floors" in interiorComponents
"costs": [0, 8, 14, 24]  # Index 1 = Refresh
```

**Change wall demolition "Moderate" cost from $4 to $5:**
```bash
# In src/costs.json, find "demoWalls" in demolitionComponents
"costs": [0, 2, 5, 6, 8]  # Index 2 = Moderate
```

**Change restroom "Basic Spec" cost from $85 to $90:**
```bash
# In src/costs.json, find restroomComponent
"costs": [0, 40, 65, 90, 110]  # Index 3 = Basic Spec
```

### When User Says "Update X cost to Y"
1. **Don't read App.jsx** - all costs are in `src/costs.json`
2. **Identify the component** from the reference above
3. **Identify the level** (As-Is=0, Refresh=1, Upgrade=2, Alpha=3, or demolition levels)
4. **Edit the specific index** in the costs array
5. **Vite will hot-reload** automatically

## Quick Reference

> Shortcuts (qplan, qcode) are defined in global `~/.claude/CLAUDE.md`
