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

## Quick Reference

> Shortcuts (qplan, qcode) are defined in global `~/.claude/CLAUDE.md`
