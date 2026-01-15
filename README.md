# Optimizer Prime Dashboard

React construction cost estimator with room-by-room budget tracking. Built for Alpha Public Schools.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GCS
npm run build
gsutil -m rsync -r -d dist/ gs://optimizer-prime-dashboard/
```

---

## 🔧 EDITING COSTS (MOST COMMON TASK)

**All construction costs are in one file:**
```bash
nano src/costs.json
```

### Quick Edit Commands:
```bash
cd /Users/brandon/Repos/optimizerPrime
nano src/costs.json          # Edit with nano (Ctrl+O save, Ctrl+X exit)
# OR
vim src/costs.json           # Edit with vim (i to edit, Esc then :wq to save)
# OR
code src/costs.json          # Edit in VS Code
```

### What's in costs.json:
- **demolitionComponents**: 6 items (Flooring, Walls, Ceiling, Lighting, HVAC, Casework)
  - 5 levels each: None, Minor, Moderate, Extreme, Complete
- **interiorComponents**: 10 items (Floors, Walls, Ceiling, Lighting, HVAC, Tech, Casework, Furniture, Appliances, Lab Equipment)
  - 4 levels each: As-Is, Refresh, Upgrade, Alpha
- **restroomComponent**: 5 levels (As-Is, Demo+Basic, Demo+Alpha, Basic, Alpha)
- **exteriorComponent**: 4 levels (As-Is, Refresh, Upgrade, Alpha)

### Example: Change flooring "Refresh" cost from $6 to $8/sqft
```json
{
  "key": "floors",
  "name": "Floors",
  "helper": "LVT, carpet, tile, transitions",
  "costs": [0, 8, 14, 24],  // Changed 6 to 8
  "appliesTo": "all"
}
```

**Changes hot-reload automatically** when you save the file (no refresh needed).

---

## Project Structure

```
optimizer-prime/
├── src/
│   ├── costs.json          ← EDIT THIS to change all costs
│   ├── App.jsx             ← Main dashboard component
│   ├── main.jsx
│   └── index.css
├── public/
├── dist/                   ← Build output (deployed to GCS)
├── vite.config.js
└── package.json
```

## Features

- **Interior & Exterior Spaces**: Separate card types with different cost models
- **Demolition Tracking**: Component-level demolition costs (floors, walls, ceiling, etc.)
- **Budget Calculator**: Auto-calculates from students × tuition - lease costs
- **Lock/Collapse Cards**: Hide completed spaces to focus on active work
- **Section-Level Controls**: Lock/unlock all spaces in a section at once
- **Left to Spend Tracker**: Visual progress bar showing budget vs. actual
- **Project Assumptions**: Adjustable design fee, escalation, GC overhead, contingency

## Development

- Built with React 18 + Vite
- Styled with Tailwind CSS
- Icons from Lucide React
- Animations with Framer Motion
- Deployed to Google Cloud Storage

## Deployment

**Before deploying:**
1. Verify GCS project:
```bash
gcloud config get-value project     # Should be: brandon-gee
gcloud config get-value account     # Should be: brandon@brandongee.me
```

2. If wrong project:
```bash
gcloud config set project brandon-gee
```

3. Build and deploy:
```bash
npm run build
gsutil -m rsync -r -d dist/ gs://optimizer-prime-dashboard/
```

**Live URL:** https://storage.googleapis.com/optimizer-prime-dashboard/index.html

---

## ⚡ Common Tasks

### Change a cost value
```bash
nano src/costs.json
# Edit the value, Ctrl+O, Ctrl+X
# Dev server auto-reloads
```

### Add a new room type
Edit `src/App.jsx` → `ROOM_TYPES` array (around line 30)

### Change default budget inputs
Edit `src/App.jsx` → `useState` defaults (around line 421-424):
- `setTargetStudents(25)`
- `setTuition(50000)`
- `setLeaseCost(10000)`
- `setLeaseTerm(2)`

### Modify project assumptions defaults
Edit `src/App.jsx` → `useState` defaults (around line 417-420):
- `setContingencyPct(10)`
- `setGcOverheadPct(14)`
- `setEscalationPct(3)`
- `setDesignFeePct(6)`

---

Built by Brandon Gee for Alpha Public Schools
