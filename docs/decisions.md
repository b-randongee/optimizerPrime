# Architecture Decisions — optimizerPrime

> **Purpose**: Log WHY things are the way they are.

---

## Decision Log

### ADR-001: Static Site on GCS
**Date**: 2026-01-15
**Status**: ✅ Implemented

**Context**:
React website needs hosting solution. User chose Google Cloud Storage.

**Decision**:
Host React build output as static website on Google Cloud Storage bucket.

**Rationale**:
- Cost-effective for static sites
- Simple deployment (just sync build folder)
- Integrates with existing GCS project (brandon-gee)
- No server management needed
- Fast CDN delivery

**Alternatives Considered**:
- Firebase Hosting: More features but overkill for simple static site
- Cloud Run: Unnecessary for static content
- App Engine: Too heavy for static files

**Implementation**:
- Bucket: `optimizer-prime-dashboard`
- Public read access configured
- Website config: index.html as main page
- Live at: https://storage.googleapis.com/optimizer-prime-dashboard/index.html

---

### ADR-002: Vite as Build Tool
**Date**: 2026-01-15
**Status**: ✅ Implemented

**Context**:
Need a modern build tool for React that works well with GCS static hosting.

**Decision**:
Use Vite 5 as the build tool instead of Create React App or Next.js.

**Rationale**:
- Fast dev server with Hot Module Replacement (HMR)
- Quick production builds (sub-3 seconds for this app)
- Native ESM support
- Simple configuration
- Perfect for static site generation (no SSR complexity)
- Smaller bundle size than CRA

**Alternatives Considered**:
- Create React App: Slower builds, deprecated, heavier
- Next.js: Overkill for simple static site, SSR not needed
- Parcel: Less ecosystem support than Vite

**Results**:
- Build time: ~2.2 seconds
- Bundle size: 658KB (193KB gzipped)
- Dev server startup: < 1 second

---

### ADR-003: Tailwind CSS for Styling
**Date**: 2026-01-15
**Status**: ✅ Implemented

**Context**:
The provided React code uses extensive Tailwind utility classes for styling.

**Decision**:
Configure Tailwind CSS 3 with PostCSS and Autoprefixer.

**Rationale**:
- Code already written with Tailwind classes
- Utility-first approach matches the design system
- Good tree-shaking (only includes used classes)
- Responsive design utilities built-in
- No alternative without rewriting all styles

**Implementation**:
- Tailwind config scans src/**/*.{js,jsx,tsx}
- PostCSS processes Tailwind directives
- Final CSS: 11.71 KB (3.07 KB gzipped)

---

## Quick Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-15 | GCS for hosting | Simple, cost-effective static site hosting |

---

## Future Considerations

- [ ] Consider Cloud CDN for global distribution if needed
- [ ] Consider Firebase Hosting if we need preview channels or complex routing
- [ ] May need Cloud Functions if we add API endpoints later
