import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

// ROOM_TYPES definition for reference
const ROOM_TYPES = [
  // Interior spaces
  { key: "breakroom", label: "Break Room", icon: "☕", isExterior: false },
  { key: "conferenceroom", label: "Conference Room", icon: "💼", isExterior: false },
  { key: "hallway", label: "Hallway", icon: "🚶", isExterior: false },
  { key: "learningroom", label: "Learning Room", icon: "📚", isExterior: false },
  { key: "limitlessroom", label: "Limitless Room", icon: "🧪", isExterior: false },
  { key: "lobby", label: "Lobby", icon: "🛎️", isExterior: false },
  { key: "multipurpose", label: "Multi-Purpose Room", icon: "🎯", isExterior: false },
  { key: "office", label: "Office", icon: "🧑‍💻", isExterior: false },
  { key: "otherroom", label: "Other Room", icon: "🏢", isExterior: false },
  { key: "restroom", label: "Restroom", icon: "🚻", isExterior: false },
  { key: "rocketroom", label: "Rocket Room", icon: "🚀", isExterior: false },
  // Exterior spaces
  { key: "ballcourt", label: "Ball Court", icon: "🏀", isExterior: true },
  { key: "fencing", label: "Fencing", icon: "🔲", isExterior: true },
  { key: "field", label: "Field", icon: "🌾", isExterior: true },
  { key: "landscape", label: "Landscape", icon: "🌳", isExterior: true },
  { key: "pavement", label: "Pavement/Asphalt", icon: "🛣️", isExterior: true },
  { key: "playground", label: "Playground", icon: "🛝", isExterior: true },
  // Special types
  { key: "demolition", label: "Demolition", icon: "🔨", isExterior: false },
];

// Currency formatter
const currency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Compact location card for left sidebar
 * Shows room name, type, cost, $/sf, and lock button
 * Memoized to prevent unnecessary re-renders when other rooms change
 */
function LocationCard({
  id,
  name,
  type,
  cost,
  sqft,
  locked,
  selected,
  onSelect,
  onLockToggle
}) {
  const roomType = ROOM_TYPES.find(rt => rt.key === type);
  const isExterior = roomType?.isExterior || false;
  const isDemolition = type === 'demolition';

  // Generate unique ID for aria-describedby
  const costDetailsId = `cost-details-${id}`;

  // Cost change detection for flash animation
  const [prevCost, setPrevCost] = useState(cost);
  const [shouldFlash, setShouldFlash] = useState(false);

  useEffect(() => {
    if (cost !== prevCost && prevCost !== null) {
      // Cost changed - trigger flash
      setShouldFlash(true);
      setPrevCost(cost);

      // Remove flash after animation completes
      const timer = setTimeout(() => setShouldFlash(false), 600);
      return () => clearTimeout(timer);
    } else if (prevCost === null) {
      // First render - just set initial value
      setPrevCost(cost);
    }
  }, [cost, prevCost]);

  // Border color based on type + selection
  const borderColor = selected
    ? (isDemolition ? 'border-orange-500' : isExterior ? 'border-blue-500' : 'border-emerald-500')
    : 'border-slate-200';

  const bgColor = selected ? 'bg-slate-50' : 'bg-white';

  return (
    <div
      className={`rounded-2xl border-2 p-3 mb-2 cursor-pointer transition-all ${borderColor} ${bgColor} hover:shadow-sm`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      aria-label={`${name}, ${roomType?.label || type}${selected ? ', currently selected' : ''}`}
      aria-describedby={costDetailsId}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Icon + Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{roomType?.icon || '📦'}</span>
            <span className="text-sm font-semibold truncate">{name}</span>
          </div>

          {/* Type + Square Footage */}
          <div className="text-xs text-slate-500">
            {roomType?.label || type} · {sqft.toLocaleString()} sf
          </div>

          {/* Cost Summary with flash animation on change */}
          <motion.div
            className="mt-2"
            id={costDetailsId}
            animate={{
              backgroundColor: shouldFlash ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0)',
              scale: shouldFlash ? 1.05 : 1
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ borderRadius: '8px', padding: '4px' }}
          >
            <div className="text-sm font-semibold text-slate-900">
              {currency(cost)}
            </div>
            <div className="text-xs text-slate-500">
              {currency(cost / sqft)}/sf
            </div>
          </motion.div>
        </div>

        {/* Lock Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger card selection
            onLockToggle();
          }}
          className="shrink-0 h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          aria-label={locked ? "Unlock" : "Lock"}
          data-lock-button={locked ? "locked" : "unlocked"}
        >
          {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when unrelated props change
// Only re-render when these specific props change
export default React.memo(LocationCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type &&
    prevProps.cost === nextProps.cost &&
    prevProps.sqft === nextProps.sqft &&
    prevProps.locked === nextProps.locked &&
    prevProps.selected === nextProps.selected
    // onSelect and onLockToggle are functions and don't need comparison
  );
});
