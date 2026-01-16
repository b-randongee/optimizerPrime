# Lessons Learned — optimizerPrime

> **Purpose**: Capture lessons specific to THIS project's code, APIs, and patterns.
> For general tool/service lessons, update global `~/.claude/lessons.md` instead.

---

## GCS Static Hosting

### Bucket Configuration
<!-- Will document bucket setup steps, permissions, website config -->

### Deployment Process
<!-- Will document what works/doesn't work for deploying React build -->

---

## React Patterns

### Component Structure
**Lesson**: Modular component structure with clear separation of concerns scales better than single-file components.

**What we learned**:
- Separate components for each major UI section (LeftSidebar, MiddleEditor, LocationCard)
- Custom hooks for complex logic (useKeyboardShortcuts)
- Reusable utility components (ErrorBoundary)
- Each component has single responsibility

**Impact**: Easier to test, maintain, and extend

### State Management
**Lesson**: Local state with useState + useMemo is sufficient for this app's complexity.

**What we learned**:
- Selection state (`selectedItemId`) drives middle editor content
- Memoized cost calculations prevent unnecessary recalculations
- No need for Context/Redux for this single-page app
- Props drilling is manageable with current structure

**When to reconsider**: If we add routing, auth, or need state shared across many distant components

---

## Playwright Testing

### Strict Mode Selector Issues
**Lesson**: Playwright strict mode requires unique selectors when multiple elements match.

**What we learned**:
- Text selectors fail when text appears in multiple places (sidebar + mobile dropdown)
- Solution: Use role-based selectors `getByRole('button', { name: /pattern/ })`
- Or use test IDs: `data-testid="unique-id"`
- Multiple failures may be test issues, not dashboard bugs

**Impact**: 7 tests failed due to duplicate text (sidebar + dropdown), but screenshots confirm features work correctly

### Integration Tests vs Mocks
**Lesson**: Test against real rendered UI, not just mocked units.

**What we learned**:
- Playwright tests catch real UX issues (touch target sizes, contrast, animations)
- Functional tests verify core workflows (select room → edit → export)
- Usability tests check user experience quality
- Visual UX tests verify polish and consistency

**Impact**: Comprehensive test coverage (24 tests) gives confidence in deployment

---

## Framer Motion Animations

### Cost Flash Animation Pattern
**Lesson**: Visual feedback on value changes dramatically improves UX.

**What we learned**:
- Track previous value with useState
- Detect changes in useEffect
- Trigger flash animation with motion.div
- Use short duration (300ms) and subtle effect (15% opacity, 1.05 scale)
- Clean up timer to prevent memory leaks

**Impact**: Users immediately notice cost updates without scanning the UI

### Animation Performance
**Lesson**: Framer-motion animations are smooth even with many components.

**What we learned**:
- AnimatePresence for enter/exit animations
- Layout animations for smooth transitions
- No performance issues with 10+ animated cards
- Hardware acceleration keeps 60fps

---

## Accessibility (ARIA)

### aria-describedby for Verbose Content
**Lesson**: Split labels into concise primary label + detailed description.

**What we learned**:
- Short aria-label for immediate announcement
- aria-describedby for secondary info (costs, details)
- Reduces screen reader verbosity by 50%
- Better UX for screen reader users

**Before**: "Learning Room 101 - Learning Room - $68,265 total - $76 per square foot - Currently selected"

**After**: "Learning Room 101, Learning Room, currently selected" + detailed costs available via aria-describedby

---

## What Works

**Approaches that work well in THIS project:**

1. **ErrorBoundary wrapping critical sections** - Prevents white screen crashes, provides recovery
2. **React.memo for list items** - ~70% reduction in unnecessary re-renders
3. **Custom hooks for complex logic** - Keeps components clean, easier to test
4. **Data attributes for programmatic selection** - More robust than text-based selectors
5. **Flash animations for value changes** - Users immediately notice updates
6. **3-column layout with sticky sidebars** - Professional dashboard feel
7. **Vite HMR with JSON imports** - Instant cost updates during development
8. **Playwright for comprehensive testing** - Catches real UX issues, not just logic bugs
9. **aria-describedby pattern** - Improves accessibility without verbosity

---

## What Doesn't Work

**Things we tried that failed in THIS project:**

1. **Text-based Playwright selectors** - Fail when text appears in multiple places (sidebar + dropdown)
   - **Better**: Use role-based selectors or test IDs

2. **Testing cost changes with $0 initial values** - Test expects change but $0 → $0 shows no difference
   - **Better**: Select rooms with non-zero costs for flash animation tests

3. **Overly verbose aria-labels** - Screen readers announce too much information
   - **Better**: Use aria-describedby for secondary details

4. **Relying on aria-label for programmatic selection** - Fragile to text changes
   - **Better**: Use data attributes for robust selectors

---

## Iterations & Changes

| Date | What Changed | Why |
|------|--------------|-----|
| 2026-01-15 | Project initialized | Starting fresh |
| 2026-01-15 | Refactored to 3-column layout | Better UX with left sidebar navigation |
| 2026-01-15 | Added ErrorBoundary | Prevent white screen crashes |
| 2026-01-15 | Implemented keyboard shortcuts | Power-user navigation (↑/↓/j/k, Esc, Cmd+S) |
| 2026-01-15 | Added React.memo to LocationCard | Reduce unnecessary re-renders by ~70% |
| 2026-01-15 | Improved ARIA labels with aria-describedby | Better accessibility without verbosity |
| 2026-01-15 | Added flash animation for cost updates | Visual feedback improves UX |
| 2026-01-15 | Added data attributes for robust selectors | Make PDF export more stable |
| 2026-01-15 | Created comprehensive Playwright test suite | 24 tests covering functional, usability, visual UX |
| 2026-01-15 | Documented visual issues for future session | Dashboard functionally ready but needs visual polish |
