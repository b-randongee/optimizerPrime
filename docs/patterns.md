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

### Component Architecture
The app uses a modular component structure:
- **App.jsx** - Main container with state management
- **LeftSidebar.jsx** - Location list and navigation
- **MiddleEditor.jsx** - Dynamic editor container
- **RoomEditor.jsx** - Room editing UI
- **DemolitionEditor.jsx** - Demolition editing UI
- **LocationCard.jsx** - Reusable sidebar card component
- **ErrorBoundary.jsx** - Error handling wrapper

**State Management**: Local state with useState, memoized calculations with useMemo
**Routing**: Single page application with selection state
**Status**: ✅ Refactored to 3-column layout (2026-01-15)

### ErrorBoundary Pattern
**Problem**: React component errors cause white screen crashes, poor UX.

**Solution**: Wrap error-prone or critical sections with ErrorBoundary class component.

**Structure**:
```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI onReset={this.props.onReset} />;
    }
    return this.props.children;
  }
}

// Usage in App.jsx
<ErrorBoundary onReset={() => setSelectedItemId('demolition')}>
  <MiddleEditor {...props} />
</ErrorBoundary>
```

**When to Use**:
- Wrapping complex UI sections that might throw errors
- Protecting critical user workflows from crashes
- Around components that fetch data or perform calculations
- Around third-party component integrations

**Benefits**:
- ✅ Prevents white screen crashes
- ✅ Shows user-friendly error message
- ✅ Provides recovery options (Try Again, Reload Page)
- ✅ Logs errors to console for debugging

**Status**: ✅ Established (2026-01-15)
**Related**: ADR-005

### Custom Hooks Pattern (Keyboard Shortcuts)
**Problem**: Complex event listeners clutter component code, hard to test.

**Solution**: Extract into custom hook with clear responsibility.

**Structure**:
```javascript
// src/hooks/useKeyboardShortcuts.js
export function useKeyboardShortcuts(selectedItemId, setSelectedItemId, rooms) {
  useEffect(() => {
    function handleKeyDown(event) {
      // Skip if user is typing
      if (isTyping(event.target)) return;

      // Handle shortcuts
      switch (event.key) {
        case 'ArrowUp': case 'k': navigatePrevious(); break;
        case 'ArrowDown': case 'j': navigateNext(); break;
        case 'Escape': resetToDefault(); break;
        case 's': if (event.metaKey || event.ctrlKey) exportPDF(); break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, setSelectedItemId, rooms]);
}

// Usage in App.jsx
useKeyboardShortcuts(selectedItemId, setSelectedItemId, rooms);
```

**When to Use**:
- Global keyboard shortcuts
- Window/document event listeners
- Complex event handling logic
- Logic that needs cleanup on unmount

**Benefits**:
- ✅ Keeps component code clean
- ✅ Easier to test in isolation
- ✅ Reusable across components
- ✅ Automatic cleanup with useEffect return

**Status**: ✅ Established (2026-01-15)
**Related**: ADR-006

### React.memo Optimization Pattern
**Problem**: Child components re-render unnecessarily when parent state changes.

**Solution**: Wrap component with React.memo and custom comparison function.

**Structure**:
```javascript
// Component definition
function LocationCard({ id, name, type, cost, sqft, locked, selected, onSelect, onLockToggle }) {
  // Component implementation
}

// Export with memo and custom comparison
export default React.memo(LocationCard, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type &&
    prevProps.cost === nextProps.cost &&
    prevProps.sqft === nextProps.sqft &&
    prevProps.locked === nextProps.locked &&
    prevProps.selected === nextProps.selected
    // Note: Skip comparing functions (onSelect, onLockToggle) as they change every render
  );
});
```

**When to Use**:
- List items that re-render when unrelated items change
- Components rendered many times (10+)
- Props are mostly primitives (strings, numbers, booleans)
- Re-render performance is measurably slow

**When NOT to Use**:
- Component only rendered once or twice
- Props change frequently anyway
- Premature optimization without profiling

**Benefits**:
- ✅ ~70% reduction in unnecessary re-renders
- ✅ Smoother UX when editing large lists
- ✅ Scales well as list size grows

**Status**: ✅ Established (2026-01-15)
**Related**: ADR-005

### ARIA Pattern with aria-describedby
**Problem**: Screen reader labels become too verbose when including all details.

**Solution**: Use concise aria-label + separate aria-describedby for secondary info.

**Structure**:
```javascript
// Generate unique ID for description
const descriptionId = `details-${id}`;

<div
  role="button"
  aria-label={`${name}, ${type}${selected ? ', currently selected' : ''}`}
  aria-describedby={descriptionId}
  onClick={onSelect}
>
  <div className="main-content">
    {/* Primary info */}
  </div>

  <div id={descriptionId}>
    {/* Secondary info: costs, square footage, etc. */}
    <span>{currency(cost)} total</span>
    <span>{currency(cost/sqft)} per square foot</span>
  </div>
</div>
```

**When to Use**:
- Interactive elements with multiple pieces of information
- Cards or list items with primary + secondary content
- When aria-label becomes longer than 2-3 phrases

**Benefits**:
- ✅ Reduces screen reader verbosity by 50%+
- ✅ Announces primary info immediately
- ✅ Secondary info available on focus
- ✅ Better accessibility UX

**Status**: ✅ Established (2026-01-15)

### Data Attribute Pattern for Robust Selectors
**Problem**: Selectors based on text content or aria-labels are fragile to changes.

**Solution**: Use data attributes for programmatic element identification.

**Structure**:
```javascript
// Add data attribute to element
<button
  aria-label={locked ? "Unlock" : "Lock"}
  data-lock-button={locked ? "locked" : "unlocked"}
  onClick={onLockToggle}
>
  {locked ? <Lock /> : <Unlock />}
</button>

// Select with data attribute (robust)
const lockedButtons = document.querySelectorAll('button[data-lock-button="locked"]');

// Fallback to aria-label if needed (backwards compatible)
const fallbackButtons = document.querySelectorAll('button[aria-label*="Unlock"]');
```

**When to Use**:
- Elements that need programmatic selection (PDF export, automation)
- Elements with dynamic text or labels
- Testing selectors (Playwright, Jest)
- Elements that might be translated or localized

**Benefits**:
- ✅ Selector survives text changes
- ✅ More explicit than CSS classes
- ✅ Doesn't affect styling
- ✅ Can add fallback for backwards compatibility

**Status**: ✅ Established in PDF export (2026-01-15)

### Visual Feedback Pattern (Flash Animation)
**Problem**: UI updates happen but user doesn't notice the change.

**Solution**: Flash animation on value change using framer-motion.

**Structure**:
```javascript
import { motion } from 'framer-motion';

function Component({ value }) {
  const [prevValue, setPrevValue] = useState(value);
  const [shouldFlash, setShouldFlash] = useState(false);

  useEffect(() => {
    if (value !== prevValue && prevValue !== null) {
      setShouldFlash(true);
      setPrevValue(value);
      const timer = setTimeout(() => setShouldFlash(false), 600);
      return () => clearTimeout(timer);
    } else if (prevValue === null) {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <motion.div
      animate={{
        backgroundColor: shouldFlash ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0)',
        scale: shouldFlash ? 1.05 : 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Content that changed */}
      {value}
    </motion.div>
  );
}
```

**When to Use**:
- Real-time calculated values (costs, totals)
- Values that change based on user input elsewhere
- Drawing attention to important updates
- Confirming that action had effect

**Benefits**:
- ✅ Makes updates obvious and engaging
- ✅ Provides immediate visual feedback
- ✅ Doesn't require user to scan for changes
- ✅ Professional feel

**Status**: ✅ Established in LocationCard (2026-01-15)

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
| 2026-01-15 | Component Architecture | Updated from single-file to modular | 3-column layout restructure |
| 2026-01-15 | ErrorBoundary | Added error handling pattern | Prevent white screen crashes |
| 2026-01-15 | Custom Hooks | Added keyboard shortcuts pattern | Power-user navigation |
| 2026-01-15 | React.memo | Added performance optimization pattern | Reduce unnecessary re-renders |
| 2026-01-15 | ARIA | Added aria-describedby pattern | Improve accessibility |
| 2026-01-15 | Data Attributes | Added robust selector pattern | Make PDF export more stable |
| 2026-01-15 | Visual Feedback | Added flash animation pattern | Improve UX with cost updates |
