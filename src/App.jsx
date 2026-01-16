import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Ruler,
  ClipboardList,
  Building2,
  BadgeDollarSign,
  Sparkles,
  SlidersHorizontal,
  Lock,
  Unlock,
  Menu,
  X,
  Info,
  Download,
} from "lucide-react";
import costsData from "./costs.json";
import ExportPDFButton from "./components/ExportPDFButton";
import LeftSidebar from "./components/LeftSidebar";
import MiddleEditor from "./components/MiddleEditor";
import ErrorBoundary from "./components/ErrorBoundary";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

// Dummy pricing model
// Levels: 0 = As-Is, 1 = Refresh, 2 = Upgrade, 3 = Alpha
const LEVELS = [
  { value: 0, label: "As-Is", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 1, label: "Refresh", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: 2, label: "Upgrade", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: 3, label: "Alpha", tone: "bg-blue-50 text-blue-700 border-blue-200" },
];

const DEMOLITION_COMPONENTS = costsData.demolitionComponents;

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
];

// Component cost adders per sqft by level
// appliesTo: "all" means applies to all room types
// appliesTo: [...] array means applies only to those specific room types
const COMPONENTS = costsData.interiorComponents;

const RESTROOM_COMPONENT = costsData.restroomComponent;

const EXTERIOR_COMPONENT = costsData.exteriorComponent;

function currency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function levelMeta(v) {
  return LEVELS.find((x) => x.value === v) || LEVELS[0];
}

function getApplicableComponents(roomType) {
  return COMPONENTS.filter(c =>
    !c.appliesTo || c.appliesTo === "all" || c.appliesTo.includes(roomType)
  );
}

function SegPill({ text, tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {text}
    </span>
  );
}

function Range({ value, onChange, min = 0, max = 3, step = 1, disabled = false }) {
  return (
    <input
      type="range"
      className="w-full accent-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      disabled={disabled}
    />
  );
}

function MiniKey({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}


const BUILDING_PRESETS = [
  {
    key: "asis",
    name: "As-Is",
    level: 0,
  },
  {
    key: "refresh",
    name: "Refresh",
    level: 1,
  },
  {
    key: "upgrade",
    name: "Upgrade",
    level: 2,
  },
  {
    key: "alpha",
    name: "Alpha Spec",
    level: 3,
  },
];

function defaultRoom(overrides = {}) {
  const isExterior = overrides.isExterior || false;
  return {
    id: uid(),
    name: isExterior ? "Space" : "Room",
    type: isExterior ? "playground" : "learningroom",
    sqft: 800,
    isExterior: isExterior,
    restroomCount: 0,
    restroomArea: 60,
    locked: false,
    // component levels
    levels: Object.fromEntries(COMPONENTS.map((c) => [c.key, 1])),
    restroomSpec: 0,
    exteriorSpec: 0,
    ...overrides,
  };
}

function getIntensityByType(type) {
  // Heuristic multipliers for the same component spec
  // Hallways and rocket rooms typically have less finish intensity.
  if (type === "hallway") return 0.8;
  if (type === "rocketroom") return 0.6;
  if (type === "lobby") return 1.15;
  if (type === "limitlessroom") return 1.25;
  if (type === "restroom") return 1.0;
  if (type === "conferenceroom") return 1.1;
  if (type === "breakroom") return 0.9;
  if (type === "multipurpose") return 1.0;
  return 1.0;
}

function roomCost(room) {
  // Exterior spaces use exteriorSpec only
  if (room.isExterior) {
    const extLvl = clamp(room.exteriorSpec ?? 0, 0, 3);
    const exteriorCost = room.sqft * EXTERIOR_COMPONENT.costs[extLvl];
    const mobilization = room.sqft > 0 ? 450 : 0;
    return exteriorCost + mobilization;
  }

  const intensity = getIntensityByType(room.type);

  // Base finish components (per main room sqft)
  const perSqft = COMPONENTS.reduce((sum, c) => {
    const lvl = clamp(room.levels?.[c.key] ?? 0, 0, 3);
    return sum + c.costs[lvl];
  }, 0);

  // Restroom logic
  // If room is restroom, restroomSpec applies to entire sqft at restroom intensity.
  // If room has restrooms (count > 0), restroomSpec applies to restroomArea per restroom.
  const rrLvl = clamp(room.restroomSpec ?? 0, 0, 4);
  const restroomCount = room.restroomCount ?? 0;
  const restroomSqft = room.type === "restroom" ? room.sqft : restroomCount > 0 ? clamp(room.restroomArea ?? 60, 20, 250) * restroomCount : 0;
  const restroomCost = restroomSqft * RESTROOM_COMPONENT.costs[rrLvl];

  const mainArea = room.type === "restroom" ? 0 : room.sqft;
  const mainCost = mainArea * perSqft * intensity;

  // Allowances
  const mobilization = room.sqft > 0 ? 450 : 0;
  const punch = room.sqft > 0 ? 0.35 * room.sqft : 0;

  return mainCost + restroomCost + mobilization + punch;
}

const DEMOLITION_LEVEL_LABELS = ["None", "Minor", "Moderate", "Extreme", "Complete"];

function formatLevelLabel(component, value) {
  if (component.key === "restroomSpec") {
    return RESTROOM_COMPONENT.levels.find((x) => x.value === value)?.label || "As-Is";
  }
  if (component.key === "exteriorSpec") {
    return EXTERIOR_COMPONENT.levels.find((x) => x.value === value)?.label || "As-Is";
  }
  // Check if it's a demolition component
  if (component.key && component.key.startsWith("demo")) {
    return DEMOLITION_LEVEL_LABELS[value] || "None";
  }
  return levelMeta(value).label;
}

function ComponentRow({ title, helper, value, onChange, costPerSqft, labelOverride, max = 3, sliderLabels, disabled = false }) {
  const meta = levelMeta(value);
  const text = labelOverride || meta.label;

  const defaultLabels = max === 4
    ? ['As-Is', 'Demo+Basic', 'Demo+Alpha', 'Basic', 'Alpha']
    : ['0', '1', '2', '3'];

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <SegPill text={text} tone={meta.tone} />
          </div>
          <div className="mt-1 text-xs text-slate-500">{helper}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-500">Adder</div>
          <div className="text-sm font-semibold text-slate-900">{currency(costPerSqft)}/sf</div>
        </div>
      </div>

      <div className="mt-3">
        <Range value={value} onChange={onChange} max={max} disabled={disabled} />
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          {(sliderLabels || defaultLabels).map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoftDivider({ label, icon }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">Tune assumptions and see the total update instantly</div>
      </div>
    </div>
  );
}

export default function App() {
  const [rooms, setRooms] = useState(() => [
    defaultRoom({ name: "Learning Room 101", type: "learningroom", sqft: 900, restroomCount: 0 }),
    defaultRoom({ name: "Office", type: "office", sqft: 260, restroomCount: 0, locked: true }),
    defaultRoom({ name: "Restroom", type: "restroom", sqft: 160, restroomSpec: 2, levels: Object.fromEntries(COMPONENTS.map((c) => [c.key, 0])) }),
    defaultRoom({ name: "Playground", type: "playground", sqft: 1200, isExterior: true }),
  ]);

  const [contingencyPct, setContingencyPct] = useState(10);
  const [gcOverheadPct, setGcOverheadPct] = useState(14);
  const [escalationPct, setEscalationPct] = useState(3);
  const [designFeePct, setDesignFeePct] = useState(6);
  const [targetStudents, setTargetStudents] = useState(25);
  const [leaseCost, setLeaseCost] = useState(10000);
  const [tuition, setTuition] = useState(50000);
  const [leaseTerm, setLeaseTerm] = useState(2);
  const [demolitionLevels, setDemolitionLevels] = useState(
    Object.fromEntries(DEMOLITION_COMPONENTS.map((c) => [c.key, 0]))
  );
  const [demolitionLocked, setDemolitionLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Selection state for left sidebar navigation
  const [selectedItemId, setSelectedItemId] = useState(() => rooms[0]?.id || 'demolition');

  // Calculate budget: (students × tuition) - (lease cost × 12 × lease term)
  const budget = useMemo(() => {
    const totalRevenue = targetStudents * tuition;
    const totalLeaseCost = leaseCost * 12 * leaseTerm;
    const totalBudget = totalRevenue - totalLeaseCost;
    return Math.max(0, totalBudget);
  }, [targetStudents, tuition, leaseCost, leaseTerm]);

  const totals = useMemo(() => {
    // Separate interior and exterior costs
    const interiorCost = rooms.filter(r => !r.isExterior).reduce((sum, r) => sum + roomCost(r), 0);
    const exteriorCost = rooms.filter(r => r.isExterior).reduce((sum, r) => sum + roomCost(r), 0);
    const direct = interiorCost + exteriorCost;

    // Calculate demolition cost based on interior square footage and component levels
    const interiorSqft = rooms.filter(r => !r.isExterior).reduce((sum, r) => sum + (r.sqft || 0), 0);
    const exteriorSqft = rooms.filter(r => r.isExterior).reduce((sum, r) => sum + (r.sqft || 0), 0);

    // Sum up all demolition component costs
    const demoCostPerSF = DEMOLITION_COMPONENTS.reduce((sum, comp) => {
      const level = demolitionLevels[comp.key] || 0;
      return sum + comp.costs[level];
    }, 0);
    const demolition = interiorSqft * demoCostPerSF;

    const design = direct * (designFeePct / 100);
    const escalation = (direct + design + demolition) * (escalationPct / 100);
    const gc = (direct + design + escalation + demolition) * (gcOverheadPct / 100);
    const contingency = (direct + design + escalation + gc + demolition) * (contingencyPct / 100);
    const grand = direct + design + escalation + gc + contingency + demolition;
    const sqft = rooms.reduce((sum, r) => sum + (r.sqft || 0), 0);
    const cpsf = sqft > 0 ? grand / sqft : 0;

    // Calculate individual room costs for left sidebar display
    const roomCosts = rooms.map(room => {
      const total = roomCost(room);
      const perSqft = room.sqft > 0 ? total / room.sqft : 0;
      return { id: room.id, total, perSqft };
    });

    return {
      direct,
      interiorCost,
      exteriorCost,
      design,
      demolition,
      demoCostPerSF,
      escalation,
      gc,
      contingency,
      grand,
      sqft,
      interiorSqft,
      exteriorSqft,
      cpsf,
      roomCosts
    };
  }, [rooms, contingencyPct, gcOverheadPct, escalationPct, designFeePct, demolitionLevels]);


  const applyPreset = (presetKey) => {
    const preset = BUILDING_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    // Apply the preset level to all rooms
    setRooms(prev => prev.map(room => ({
      ...room,
      levels: Object.fromEntries(COMPONENTS.map((c) => [c.key, preset.level])),
      restroomSpec: room.type === "restroom" ? preset.level : room.restroomSpec,
    })));
  };

  const addRoom = (isExterior = false) => {
    const count = prev => prev.filter(r => r.isExterior === isExterior).length + 1;
    const newRoom = defaultRoom({
      name: isExterior ? `Space ${count(rooms)}` : `Room ${count(rooms)}`,
      isExterior
    });
    setRooms((prev) => [...prev, newRoom]);
    setSelectedItemId(newRoom.id); // Auto-select new room
  };
  const removeRoom = (id) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    // If deleting selected room, select another
    if (selectedItemId === id) {
      const remainingRooms = rooms.filter(r => r.id !== id);
      setSelectedItemId(remainingRooms[0]?.id || 'demolition');
    }
  };
  const updateRoom = (id, patch) =>
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Keyboard shortcuts for power users
  useKeyboardShortcuts(selectedItemId, setSelectedItemId, rooms);

  return (
    <div id="dashboard-root" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-emerald-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm backdrop-blur-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">Optimizer Prime Dashboard</div>
              <div className="text-sm text-emerald-100">
                Room-by-room budget-informed designer — Inputs update totals instantly. Built for quick scenario planning.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-12">
        {/* Left Sidebar - Location List (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <LeftSidebar
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              demolitionLocked={demolitionLocked}
              setDemolitionLocked={setDemolitionLocked}
              demolitionCost={totals.demolition}
              rooms={rooms}
              updateRoom={updateRoom}
              addRoom={addRoom}
              totals={totals}
            />
          </div>
        </div>

        {/* Middle - Dynamic Editor */}
        <div className="lg:col-span-5">
          <ErrorBoundary
            fallbackMessage="Unable to display the selected room editor. Try selecting a different room or reloading the page."
            showReloadButton={true}
            onReset={() => setSelectedItemId('demolition')}
          >
            <MiddleEditor
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              rooms={rooms}
              updateRoom={updateRoom}
              removeRoom={removeRoom}
              demolitionLevels={demolitionLevels}
              setDemolitionLevels={setDemolitionLevels}
              demolitionLocked={demolitionLocked}
              totals={totals}
            />
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {/* Export to PDF Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-html2canvas-ignore>
              <ExportPDFButton
                targetElementId="dashboard-root"
                filename="optimizer-prime-dashboard.pdf"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <BadgeDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">Total project cost</div>
                    <div className="text-sm text-slate-500">Includes global assumptions</div>
                  </div>
                </div>
              </div>

              <div className={`mt-4 rounded-3xl p-5 text-white ${
                totals.grand <= budget ? 'bg-emerald-500' : 'bg-red-600'
              }`}>
                <div className="text-sm text-white/80">Grand total</div>
                <div className="mt-1 text-3xl font-semibold tracking-tight">{currency(totals.grand)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SegPill text={`${Math.round(totals.sqft).toLocaleString()} sf`} tone="bg-white/10 text-white border-white/15" />
                  <SegPill text={`${currency(totals.cpsf)}/sf`} tone="bg-white/10 text-white border-white/15" />
                </div>
              </div>

              {/* Left to Spend Progress Tracker */}
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">Left to Spend</div>
                  <div className={`text-lg font-semibold ${
                    budget - totals.grand >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {budget - totals.grand >= 0 ? currency(budget - totals.grand) : `-${currency(Math.abs(budget - totals.grand))}`}
                  </div>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totals.grand <= budget ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((totals.grand / budget) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{currency(0)}</span>
                  <span>{currency(budget)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-700">Budget</div>
                <div className="mt-1 flex items-baseline gap-3">
                  <div className="text-2xl font-semibold text-slate-900">{currency(budget)}</div>
                  {totals.grand > budget && (
                    <div className="text-lg font-semibold text-red-600">
                      +{currency(totals.grand - budget)} over
                    </div>
                  )}
                </div>
              </div>

              <div className="my-5 border-t border-slate-200"></div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target Students</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setTargetStudents(Math.max(0, targetStudents - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Decrease students"
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                    <input
                      type="text"
                      value={targetStudents ? targetStudents.toLocaleString() : ""}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/,/g, "");
                        const val = rawVal === "" ? 0 : parseInt(rawVal, 10);
                        setTargetStudents(isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                      placeholder="0"
                      aria-label="Target Students"
                    />
                    <button
                      onClick={() => setTargetStudents(targetStudents + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Increase students"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tuition</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setTuition(Math.max(0, tuition - 1000))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Decrease tuition"
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={tuition ? tuition.toLocaleString() : ""}
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/,/g, "");
                          const val = rawVal === "" ? 0 : parseInt(rawVal, 10);
                          setTuition(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pr-12 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="0"
                        aria-label="Tuition"
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">/mo</div>
                    </div>
                    <button
                      onClick={() => setTuition(tuition + 1000)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Increase tuition"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lease Cost</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setLeaseCost(Math.max(0, leaseCost - 50))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Decrease lease cost"
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={leaseCost ? leaseCost.toLocaleString() : ""}
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/,/g, "");
                          const val = rawVal === "" ? 0 : parseInt(rawVal, 10);
                          setLeaseCost(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pr-12 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="0"
                        aria-label="Lease Cost"
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">/mo</div>
                    </div>
                    <button
                      onClick={() => setLeaseCost(leaseCost + 50)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Increase lease cost"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lease Term</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setLeaseTerm(Math.max(0, leaseTerm - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Decrease lease term"
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={leaseTerm ? leaseTerm.toLocaleString() : ""}
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/,/g, "");
                          const val = rawVal === "" ? 0 : parseInt(rawVal, 10);
                          setLeaseTerm(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pr-12 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                        placeholder="1"
                        aria-label="Lease Term"
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">yrs</div>
                    </div>
                    <button
                      onClick={() => setLeaseTerm(leaseTerm + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      aria-label="Increase lease term"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                  <SlidersHorizontal className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <div className="text-base font-semibold">Project assumptions</div>
                  <div className="text-sm text-slate-500">
                    Global multipliers applied after room costs
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Design fee</div>
                      <div className="text-xs text-slate-500">Architecture, MEP engineering, PM</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{designFeePct}%</div>
                      <div className="text-xs text-slate-500">{currency(totals.design)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      className="w-full accent-slate-900"
                      min={0}
                      max={12}
                      step={1}
                      value={designFeePct}
                      onChange={(e) => setDesignFeePct(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Escalation</div>
                      <div className="text-xs text-slate-500">Market drift, lead-time risk</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{escalationPct}%</div>
                      <div className="text-xs text-slate-500">{currency(totals.escalation)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      className="w-full accent-slate-900"
                      min={0}
                      max={10}
                      step={1}
                      value={escalationPct}
                      onChange={(e) => setEscalationPct(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">GC overhead + profit</div>
                      <div className="text-xs text-slate-500">General conditions, supervision</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{gcOverheadPct}%</div>
                      <div className="text-xs text-slate-500">{currency(totals.gc)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      className="w-full accent-slate-900"
                      min={8}
                      max={25}
                      step={1}
                      value={gcOverheadPct}
                      onChange={(e) => setGcOverheadPct(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Contingency</div>
                      <div className="text-xs text-slate-500">Unknowns, scope refinement</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{contingencyPct}%</div>
                      <div className="text-xs text-slate-500">{currency(totals.contingency)}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      className="w-full accent-slate-900"
                      min={0}
                      max={20}
                      step={1}
                      value={contingencyPct}
                      onChange={(e) => setContingencyPct(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            Optimizer Prime Dashboard Built By Brandon Gee
          </div>
        </div>
      </div>
    </div>
  );
}
