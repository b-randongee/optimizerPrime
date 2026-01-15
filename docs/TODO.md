# TODO — optimizerPrime

> Update via `/done` command at end of each session.

---

## In Progress

- None currently

---

## Up Next

- [ ] Test site on mobile devices
- [ ] Add localStorage persistence for room configurations
- [ ] Add export functionality (PDF/CSV)
- [ ] Set up custom domain (if needed)
- [ ] Add analytics (Google Analytics or similar)

---

## Backlog

- [ ] Add CI/CD pipeline (GitHub Actions for auto-deploy on push?)
- [ ] Implement accessibility improvements (WCAG AA compliance)
- [ ] Add "Save/Load Project" feature
- [ ] Add URL state serialization for sharing configs
- [ ] Consider code splitting for performance
- [ ] Add loading states for future backend integration
- [ ] Mobile UX refinements

---

## Known Bugs

- Bundle size warning (658KB) - consider code splitting if this becomes an issue
- Some npm audit warnings (2 moderate) - non-critical

---

## Completed

- [x] 2026-01-15: Initialize project with Claude Code configuration
- [x] 2026-01-15: Set up Vite + React project structure
- [x] 2026-01-15: Configure Tailwind CSS with PostCSS
- [x] 2026-01-15: Integrate construction dashboard code
- [x] 2026-01-15: Install all dependencies (React, framer-motion, recharts, lucide-react)
- [x] 2026-01-15: Configure build process (Vite)
- [x] 2026-01-15: Test build successfully (2.2s build time)
- [x] 2026-01-15: Create GCS bucket (optimizer-prime-dashboard)
- [x] 2026-01-15: Configure bucket for website hosting
- [x] 2026-01-15: Set public read permissions
- [x] 2026-01-15: Deploy to GCS successfully
- [x] 2026-01-15: Verify live site is accessible
- [x] 2026-01-15: Document deployment process and patterns
- [x] 2026-01-15: Extract cost constants to src/costs.json for terminal editing
- [x] 2026-01-15: Refactor App.jsx to import costs from JSON
- [x] 2026-01-15: Create README.md with project overview and cost editing guide
- [x] 2026-01-15: Create COSTS_README.md with detailed cost structure docs
- [x] 2026-01-15: Update CLAUDE.md with cost configuration quick reference
- [x] 2026-01-15: Document ADR-004 (JSON file over hamburger UI decision)
- [x] 2026-01-15: Document external JSON configuration pattern
- [x] 2026-01-15: Commit changes to git and push to remote
- [x] 2026-01-15: Deploy updated dashboard to GCS
