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
} from "lucide-react";
import costsData from "./costs.json";

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
    defaultRoom({ name: "Office", type: "office", sqft: 260, restroomCount: 0 }),
    defaultRoom({ name: "Restroom", type: "restroom", sqft: 160, restroomSpec: 2, levels: Object.fromEntries(COMPONENTS.map((c) => [c.key, 0])) }),
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
      cpsf
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
    setRooms((prev) => [...prev, defaultRoom({
      name: isExterior ? `Space ${count(prev)}` : `Room ${count(prev)}`,
      isExterior
    })]);
  };
  const removeRoom = (id) => setRooms((prev) => prev.filter((r) => r.id !== id));
  const updateRoom = (id, patch) =>
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
        {/* Main */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Demolition Section */}
            <div className="flex items-center gap-3 pb-4">
              <div className="flex-1 border-t border-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-orange-600">Demolition — {currency(totals.demolition)}</div>
                <button
                  onClick={() => setDemolitionLocked(!demolitionLocked)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-orange-300 bg-white text-orange-600 hover:bg-orange-50"
                  aria-label={demolitionLocked ? "Unlock demolition" : "Lock demolition"}
                  title={demolitionLocked ? "Unlock demolition" : "Lock demolition"}
                >
                  {demolitionLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </button>
              </div>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            <div className="space-y-4 pb-6">
              <div className="rounded-3xl border-2 border-orange-500 bg-slate-50 p-4">
                {demolitionLocked ? (
                  /* Collapsed locked view */
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDemolitionLocked(false)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                      aria-label="Unlock demolition"
                      title="Unlock"
                    >
                      <Lock className="h-5 w-5" />
                    </button>
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Demolition</div>
                        <div className="text-xs text-slate-500">Demolition</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900">{currency(totals.demolition)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Full expanded view */
                  <>
                {/* Demolition header */}
                <div className="flex items-start gap-3">
                  {/* Left column: Icon, Lock */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <span className="text-lg">💥</span>
                    </div>
                    <button
                      onClick={() => setDemolitionLocked(!demolitionLocked)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                      aria-label="Lock/Unlock demolition"
                      title={demolitionLocked ? "Unlock" : "Lock"}
                    >
                      {demolitionLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Right column: Components */}
                  <div className="flex-1">
                    {/* Demolition Components */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {DEMOLITION_COMPONENTS.map((comp) => (
                        <ComponentRow
                          key={comp.key}
                          title={comp.name}
                          helper={comp.helper}
                          value={demolitionLevels[comp.key]}
                          onChange={(v) => setDemolitionLevels(prev => ({ ...prev, [comp.key]: v }))}
                          costPerSqft={comp.costs[demolitionLevels[comp.key]]}
                          labelOverride={formatLevelLabel({ key: comp.key }, demolitionLevels[comp.key])}
                          sliderLabels={DEMOLITION_LEVEL_LABELS}
                          max={4}
                          disabled={demolitionLocked}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4">
              <div className="flex-1 border-t border-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-emerald-600">Interior Spaces — {currency(totals.interiorCost)}</div>
                <button
                  onClick={() => {
                    const interiorRooms = rooms.filter(r => !r.isExterior);
                    const allLocked = interiorRooms.every(r => r.locked);
                    setRooms(prev => prev.map(r => r.isExterior ? r : { ...r, locked: !allLocked }));
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-300 bg-white text-emerald-600 hover:bg-emerald-50"
                  aria-label="Toggle lock all interior spaces"
                  title="Toggle lock all interior spaces"
                >
                  {rooms.filter(r => !r.isExterior).every(r => r.locked) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </button>
              </div>
              <div className="flex-1 border-t border-slate-300"></div>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {(() => {
                  const interiorRooms = rooms.filter(r => !r.isExterior);
                  const exteriorRooms = rooms.filter(r => r.isExterior);

                  return [
                    ...interiorRooms.map((room) => {
                      const typeMeta = ROOM_TYPES.find((t) => t.key === room.type) || ROOM_TYPES[0];
                      const cost = roomCost(room);
                      const cpsfRoom = room.sqft > 0 ? cost / room.sqft : 0;

                      const isRestroomRoom = room.type === "restroom";
                      const isExteriorSpace = room.isExterior;
                      const showEmbeddedRestroom = !isRestroomRoom && !isExteriorSpace && room.restroomCount > 0;

                      return (
                        <motion.div
                          key={room.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className={`rounded-3xl border-2 ${isExteriorSpace ? 'border-blue-500' : 'border-emerald-500'} bg-slate-50 p-4`}
                      >
                      {room.locked ? (
                        /* Collapsed locked view */
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateRoom(room.id, { locked: false })}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                            aria-label="Unlock room"
                            title="Unlock"
                          >
                            <Lock className="h-5 w-5" />
                          </button>
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{room.name}</div>
                              <div className="text-xs text-slate-500">{typeMeta.label}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-slate-900">{currency(cost)}</div>
                              <div className="text-xs text-slate-500">{currency(cpsfRoom)} / sqft</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Full expanded view */
                        <>
                      {/* Room header */}
                      <div className="flex items-start gap-3">
                        {/* Left column: Icon, Trash, Lock */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <span className="text-lg">{typeMeta.icon}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm("Really Delete?")) {
                                removeRoom(room.id);
                              }
                            }}
                            disabled={room.locked}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove room"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateRoom(room.id, { locked: !room.locked })}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                            aria-label="Lock/Unlock room"
                            title={room.locked ? "Unlock" : "Lock"}
                          >
                            {room.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Right column: All inputs */}
                        <div className="flex-1">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input
                                value={room.name}
                                onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                                disabled={room.locked}
                                className="flex-1 min-w-[120px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Room name"
                              />

                              <select
                                value={room.type}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  const newTypeMeta = ROOM_TYPES.find((t) => t.key === newType);
                                  updateRoom(room.id, {
                                    type: newType,
                                    isExterior: newTypeMeta?.isExterior || false,
                                    levels:
                                      newType === "restroom"
                                        ? Object.fromEntries(COMPONENTS.map((c) => [c.key, 0]))
                                        : room.levels,
                                  });
                                }}
                                disabled={room.locked}
                                className="flex-1 min-w-[140px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Room type"
                              >
                                {ROOM_TYPES.filter(t => t.isExterior === room.isExterior).map((t) => (
                                  <option key={t.key} value={t.key}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>

                              <div className="flex items-center gap-2 min-w-[100px] rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                <Ruler className="h-4 w-4 text-slate-500" />
                                <input
                                  type="number"
                                  value={room.sqft}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value || "0", 10);
                                    updateRoom(room.id, { sqft: clamp(isNaN(val) ? 0 : val, 0, 250000) });
                                  }}
                                  disabled={room.locked}
                                  className="w-16 bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Square feet"
                                />
                                <div className="text-xs font-semibold text-slate-500">sf</div>
                              </div>

                              {!isRestroomRoom && !isExteriorSpace && (
                                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                  <span className="text-lg">🚻</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    value={room.restroomCount}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value || "0", 10);
                                      updateRoom(room.id, { restroomCount: clamp(isNaN(val) ? 0 : val, 0, 2) });
                                    }}
                                    disabled={room.locked}
                                    className="w-12 bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Number of restrooms"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                              <MiniKey label="Room cost" value={currency(cost)} />
                              <MiniKey label="Cost per sf" value={room.sqft ? `${currency(cpsfRoom)}/sf` : "-"} />
                              <MiniKey label="Allowance" value={currency(450 + 0.35 * room.sqft)} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sliders */}
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {isExteriorSpace ? (
                          <div className="col-span-1 md:col-span-2">
                            <ComponentRow
                              title={EXTERIOR_COMPONENT.name}
                              helper={EXTERIOR_COMPONENT.helper}
                              value={room.exteriorSpec}
                              onChange={(v) => updateRoom(room.id, { exteriorSpec: v })}
                              costPerSqft={EXTERIOR_COMPONENT.costs[clamp(room.exteriorSpec, 0, 3)]}
                              labelOverride={formatLevelLabel({ key: "exteriorSpec" }, room.exteriorSpec)}
                              disabled={room.locked}
                            />
                          </div>
                        ) : isRestroomRoom ? (
                          <div className="col-span-1 md:col-span-2">
                            <ComponentRow
                              title={RESTROOM_COMPONENT.name}
                              helper={RESTROOM_COMPONENT.helper}
                              value={room.restroomSpec}
                              onChange={(v) => updateRoom(room.id, { restroomSpec: v })}
                              costPerSqft={RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 4)]}
                              labelOverride={formatLevelLabel({ key: "restroomSpec" }, room.restroomSpec)}
                              max={4}
                              disabled={room.locked}
                            />
                          </div>
                        ) : (
                          getApplicableComponents(room.type).map((c) => (
                            <ComponentRow
                              key={c.key}
                              title={c.name}
                              helper={c.helper}
                              value={room.levels?.[c.key] ?? 0}
                              onChange={(v) =>
                                updateRoom(room.id, {
                                  levels: { ...room.levels, [c.key]: v },
                                })
                              }
                              costPerSqft={c.costs[clamp(room.levels?.[c.key] ?? 0, 0, 3)]}
                              disabled={room.locked}
                            />
                          ))
                        )}

                        {showEmbeddedRestroom && Array.from({ length: room.restroomCount }).map((_, idx) => (
                          <div key={`restroom-${idx}`} className="col-span-1 md:col-span-2">
                            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    Attached restroom {room.restroomCount > 1 ? `#${idx + 1}` : ''}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Applies restroom spec pricing to the restroom area only
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                  <div className="text-xs font-semibold text-slate-500">Restroom area</div>
                                  <input
                                    type="number"
                                    value={room.restroomArea}
                                    onChange={(e) =>
                                      updateRoom(room.id, {
                                        restroomArea: clamp(parseInt(e.target.value || "0", 10), 20, 250),
                                      })
                                    }
                                    disabled={room.locked}
                                    className="w-20 bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Restroom area"
                                  />
                                  <div className="text-xs font-semibold text-slate-500">sf</div>
                                </div>
                              </div>

                              <div className="mt-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <SegPill
                                      text={formatLevelLabel({ key: "restroomSpec" }, room.restroomSpec)}
                                      tone={levelMeta(room.restroomSpec).tone}
                                    />
                                    <div className="text-xs text-slate-500">{RESTROOM_COMPONENT.helper}</div>
                                  </div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {currency(RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 4)])}/sf
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Range value={room.restroomSpec} onChange={(v) => updateRoom(room.id, { restroomSpec: v })} max={4} disabled={room.locked} />
                                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>As-Is</span>
                                    <span>Demo+Basic</span>
                                    <span>Demo+Alpha</span>
                                    <span>Basic</span>
                                    <span>Alpha</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      </>
                      )}
                    </motion.div>
                      );
                    }),

                    // Add Interior Space button
                    <div key="add-interior" className="rounded-3xl border-2 border-slate-300 bg-white p-8 flex items-center justify-center">
                      <button
                        onClick={() => addRoom(false)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-white px-4 py-2 text-sm font-semibold text-emerald-500 shadow-sm hover:bg-emerald-50"
                      >
                        <Plus className="h-4 w-4" />
                        Add Interior Space
                      </button>
                    </div>,

                    // Exterior Spaces divider (always show)
                    <div key="exterior-divider" className="flex items-center gap-3 py-2">
                      <div className="flex-1 border-t border-slate-300"></div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-blue-600">Exterior Spaces — {currency(totals.exteriorCost)}</div>
                        <button
                          onClick={() => {
                            const exteriorRooms = rooms.filter(r => r.isExterior);
                            const allLocked = exteriorRooms.every(r => r.locked);
                            setRooms(prev => prev.map(r => !r.isExterior ? r : { ...r, locked: !allLocked }));
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-300 bg-white text-blue-600 hover:bg-blue-50"
                          aria-label="Toggle lock all exterior spaces"
                          title="Toggle lock all exterior spaces"
                        >
                          {rooms.filter(r => r.isExterior).every(r => r.locked) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="flex-1 border-t border-slate-300"></div>
                    </div>,

                    // Exterior rooms
                    ...exteriorRooms.map((room) => {
                      const typeMeta = ROOM_TYPES.find((t) => t.key === room.type) || ROOM_TYPES[0];
                      const cost = roomCost(room);
                      const cpsfRoom = room.sqft > 0 ? cost / room.sqft : 0;

                      const isRestroomRoom = room.type === "restroom";
                      const isExteriorSpace = room.isExterior;
                      const showEmbeddedRestroom = !isRestroomRoom && !isExteriorSpace && room.restroomCount > 0;

                      return (
                        <motion.div
                          key={room.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-3xl border-2 ${isExteriorSpace ? 'border-blue-500' : 'border-emerald-500'} bg-slate-50 p-4`}
                        >
                          {room.locked ? (
                            /* Collapsed locked view */
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateRoom(room.id, { locked: false })}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                                aria-label="Unlock room"
                                title="Unlock"
                              >
                                <Lock className="h-5 w-5" />
                              </button>
                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{room.name}</div>
                                  <div className="text-xs text-slate-500">{typeMeta.label}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-slate-900">{currency(cost)}</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Full expanded view */
                            <>
                          {/* Room header */}
                          <div className="flex items-start gap-3">
                            {/* Left column: Icon, Trash, Lock */}
                            <div className="flex flex-col items-center gap-2">
                              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                                <span className="text-lg">{typeMeta.icon}</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm("Really Delete?")) {
                                    removeRoom(room.id);
                                  }
                                }}
                                disabled={room.locked}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Remove room"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateRoom(room.id, { locked: !room.locked })}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                                aria-label="Lock/Unlock room"
                                title={room.locked ? "Unlock" : "Lock"}
                              >
                                {room.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </button>
                            </div>

                            {/* Right column: All inputs */}
                            <div className="flex-1">
                              <div className="flex gap-2">
                                <input
                                  value={room.name}
                                  onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                                  disabled={room.locked}
                                  className="flex-1 min-w-[120px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Room name"
                                />

                                <select
                                  value={room.type}
                                  onChange={(e) => {
                                    const newType = e.target.value;
                                    const newTypeMeta = ROOM_TYPES.find((t) => t.key === newType);
                                    updateRoom(room.id, {
                                      type: newType,
                                      isExterior: newTypeMeta?.isExterior || false,
                                      levels:
                                        newType === "restroom"
                                          ? Object.fromEntries(COMPONENTS.map((c) => [c.key, 0]))
                                          : room.levels,
                                    });
                                  }}
                                  disabled={room.locked}
                                  className="flex-1 min-w-[140px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Room type"
                                >
                                  {ROOM_TYPES.filter(t => t.isExterior === room.isExterior).map((t) => (
                                    <option key={t.key} value={t.key}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {isExteriorSpace ? (
                              <div className="col-span-1 md:col-span-2">
                                <ComponentRow
                                  title={EXTERIOR_COMPONENT.name}
                                  helper={EXTERIOR_COMPONENT.helper}
                                  value={room.exteriorSpec}
                                  onChange={(v) => updateRoom(room.id, { exteriorSpec: v })}
                                  costPerSqft={EXTERIOR_COMPONENT.costs[clamp(room.exteriorSpec, 0, 3)]}
                                  labelOverride={formatLevelLabel({ key: "exteriorSpec" }, room.exteriorSpec)}
                                  disabled={room.locked}
                                />
                              </div>
                            ) : isRestroomRoom ? (
                              <div className="col-span-1 md:col-span-2">
                                <ComponentRow
                                  title={RESTROOM_COMPONENT.name}
                                  helper={RESTROOM_COMPONENT.helper}
                                  value={room.restroomSpec}
                                  onChange={(v) => updateRoom(room.id, { restroomSpec: v })}
                                  costPerSqft={RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 4)]}
                                  labelOverride={formatLevelLabel({ key: "restroomSpec" }, room.restroomSpec)}
                                  max={4}
                                  disabled={room.locked}
                                />
                              </div>
                            ) : (
                              getApplicableComponents(room.type).map((c) => (
                                <ComponentRow
                                  key={c.key}
                                  title={c.name}
                                  helper={c.helper}
                                  value={room.levels?.[c.key] ?? 0}
                                  onChange={(v) =>
                                    updateRoom(room.id, {
                                      levels: { ...room.levels, [c.key]: v },
                                    })
                                  }
                                  costPerSqft={c.costs[clamp(room.levels?.[c.key] ?? 0, 0, 3)]}
                                  disabled={room.locked}
                                />
                              ))
                            )}

                            {showEmbeddedRestroom && Array.from({ length: room.restroomCount }).map((_, idx) => (
                              <div key={`restroom-${idx}`} className="col-span-1 md:col-span-2">
                                <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <div className="text-sm font-semibold text-slate-900">
                                        Attached restroom {room.restroomCount > 1 ? `#${idx + 1}` : ''}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Applies restroom spec pricing to the restroom area only
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                      <div className="text-xs font-semibold text-slate-500">Restroom area</div>
                                      <input
                                        type="number"
                                        value={room.restroomArea}
                                        onChange={(e) =>
                                          updateRoom(room.id, {
                                            restroomArea: clamp(parseInt(e.target.value || "0", 10), 20, 250),
                                          })
                                        }
                                        disabled={room.locked}
                                        className="w-20 bg-transparent text-sm font-semibold text-slate-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Restroom area"
                                      />
                                      <div className="text-xs font-semibold text-slate-500">sf</div>
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <SegPill
                                          text={formatLevelLabel({ key: "restroomSpec" }, room.restroomSpec)}
                                          tone={levelMeta(room.restroomSpec).tone}
                                        />
                                        <div className="text-xs text-slate-500">{RESTROOM_COMPONENT.helper}</div>
                                      </div>
                                      <div className="text-sm font-semibold text-slate-900">
                                        {currency(RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 4)])}/sf
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <Range value={room.restroomSpec} onChange={(v) => updateRoom(room.id, { restroomSpec: v })} max={4} disabled={room.locked} />
                                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>As-Is</span>
                                        <span>Demo+Basic</span>
                                        <span>Demo+Alpha</span>
                                        <span>Basic</span>
                                        <span>Alpha</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          </>
                          )}
                        </motion.div>
                      );
                    }),

                    // Add Exterior Space button (always show)
                    <div key="add-exterior" className="rounded-3xl border-2 border-slate-300 bg-white p-8 flex items-center justify-center">
                      <button
                        onClick={() => addRoom(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-500 shadow-sm hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                        Add Exterior Space
                      </button>
                    </div>
                  ];
                })()}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
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
