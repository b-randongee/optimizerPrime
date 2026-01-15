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
} from "lucide-react";

// Dummy pricing model
// Levels: 0 = As-Is, 1 = Refresh, 2 = Upgrade, 3 = Alpha
const LEVELS = [
  { value: 0, label: "As-Is", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 1, label: "Refresh", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: 2, label: "Upgrade", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: 3, label: "Alpha", tone: "bg-blue-50 text-blue-700 border-blue-200" },
];

const ROOM_TYPES = [
  { key: "learningroom", label: "Learning Room", icon: "📚" },
  { key: "office", label: "Office", icon: "🧑‍💻" },
  { key: "hallway", label: "Hallway", icon: "🚶" },
  { key: "lobby", label: "Lobby", icon: "🛎️" },
  { key: "cafeteria", label: "Cafeteria", icon: "🍽️" },
  { key: "limitlessroom", label: "Limitless Room", icon: "🧪" },
  { key: "restroom", label: "Restroom", icon: "🚻" },
  { key: "rocketroom", label: "Rocket Room", icon: "🚀" },
  { key: "conferenceroom", label: "Conference Room", icon: "💼" },
  { key: "breakroom", label: "Break Room", icon: "☕" },
  { key: "multipurpose", label: "Multi-Purpose Room", icon: "🎯" },
  { key: "otherroom", label: "Other Room", icon: "🏢" },
];

// Component cost adders per sqft by level
const COMPONENTS = [
  {
    key: "floors",
    name: "Floors",
    helper: "LVT, carpet, tile, transitions",
    costs: [0, 6, 14, 24],
  },
  {
    key: "walls",
    name: "Walls",
    helper: "Patch, paint, feature, framing",
    costs: [0, 4, 10, 18],
  },
  {
    key: "ceiling",
    name: "Ceiling",
    helper: "ACT, drywall, acoustics",
    costs: [0, 3, 8, 14],
  },
  {
    key: "lighting",
    name: "Lighting",
    helper: "Fixtures, controls, daylighting",
    costs: [0, 4, 9, 16],
  },
  {
    key: "hvac",
    name: "HVAC",
    helper: "Diffusers, VAVs, units, balancing",
    costs: [0, 5, 12, 20],
  },
  {
    key: "tech",
    name: "Tech",
    helper: "Data, AV, power, devices",
    costs: [0, 3, 8, 14],
  },
  {
    key: "millwork",
    name: "Casework",
    helper: "Storage, built-ins, counters",
    costs: [0, 2, 6, 12],
  },
  {
    key: "furniture",
    name: "Furniture",
    helper: "Desks, chairs, tables, fixtures",
    costs: [0, 5, 12, 22],
  },
];

const RESTROOM_COMPONENT = {
  key: "restroomSpec",
  name: "Restroom spec",
  helper: "Fixtures, tile, partitions, plumbing",
  // Higher cost intensity per sqft of restroom area
  costs: [0, 40, 65, 95],
  levels: [
    { value: 0, label: "Leave as is" },
    { value: 1, label: "Demo + rebuild basic" },
    { value: 2, label: "Demo + rebuild medium" },
    { value: 3, label: "Demo + rebuild Alpha Spec" },
  ],
};

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

function SegPill({ text, tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}
    >
      {text}
    </span>
  );
}

function Range({ value, onChange, min = 0, max = 3, step = 1 }) {
  return (
    <input
      type="range"
      className="w-full accent-slate-900"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
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
  return {
    id: uid(),
    name: "Room",
    type: "learningroom",
    sqft: 800,
    restroomCount: 0,
    restroomArea: 60,
    // component levels
    levels: Object.fromEntries(COMPONENTS.map((c) => [c.key, 1])),
    restroomSpec: 0,
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
  if (type === "cafeteria") return 1.1;
  if (type === "restroom") return 1.0;
  if (type === "conferenceroom") return 1.1;
  if (type === "breakroom") return 0.9;
  if (type === "multipurpose") return 1.0;
  return 1.0;
}

function roomCost(room) {
  const intensity = getIntensityByType(room.type);

  // Base finish components (per main room sqft)
  const perSqft = COMPONENTS.reduce((sum, c) => {
    const lvl = clamp(room.levels?.[c.key] ?? 0, 0, 3);
    return sum + c.costs[lvl];
  }, 0);

  // Restroom logic
  // If room is restroom, restroomSpec applies to entire sqft at restroom intensity.
  // If room has restrooms (count > 0), restroomSpec applies to restroomArea per restroom.
  const rrLvl = clamp(room.restroomSpec ?? 0, 0, 3);
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

function formatLevelLabel(component, value) {
  if (component.key === "restroomSpec") {
    return RESTROOM_COMPONENT.levels.find((x) => x.value === value)?.label || "Leave as is";
  }
  return levelMeta(value).label;
}

function ComponentRow({ title, helper, value, onChange, costPerSqft, labelOverride }) {
  const meta = levelMeta(value);
  const text = labelOverride || meta.label;

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
        <Range value={value} onChange={onChange} />
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
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
  const [budget, setBudget] = useState(100000);

  const totals = useMemo(() => {
    const direct = rooms.reduce((sum, r) => sum + roomCost(r), 0);
    const design = direct * (designFeePct / 100);
    const escalation = (direct + design) * (escalationPct / 100);
    const gc = (direct + design + escalation) * (gcOverheadPct / 100);
    const contingency = (direct + design + escalation + gc) * (contingencyPct / 100);
    const grand = direct + design + escalation + gc + contingency;
    const sqft = rooms.reduce((sum, r) => sum + (r.sqft || 0), 0);
    const cpsf = sqft > 0 ? grand / sqft : 0;

    return { direct, design, escalation, gc, contingency, grand, sqft, cpsf };
  }, [rooms, contingencyPct, gcOverheadPct, escalationPct, designFeePct]);


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

  const addRoom = () => setRooms((prev) => [...prev, defaultRoom({ name: `Room ${prev.length + 1}` })]);
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
                Room-by-room budget-informed designer
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                  <ClipboardList className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <div className="text-base font-semibold">Rooms</div>
                  <div className="text-sm text-slate-500">
                    Set area, pick a room type, and adjust each scope slider to match your target finish
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs font-semibold text-slate-500">Quick start</div>
                <select
                  onChange={(e) => applyPreset(e.target.value)}
                  defaultValue=""
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  <option value="" disabled>
                    Choose a preset
                  </option>
                  {BUILDING_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <AnimatePresence initial={false}>
                {rooms.map((room) => {
                  const typeMeta = ROOM_TYPES.find((t) => t.key === room.type) || ROOM_TYPES[0];
                  const cost = roomCost(room);
                  const cpsfRoom = room.sqft > 0 ? cost / room.sqft : 0;

                  const isRestroomRoom = room.type === "restroom";
                  const showEmbeddedRestroom = !isRestroomRoom && room.restroomCount > 0;

                  return (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-3xl border-2 border-emerald-500 bg-slate-50 p-4"
                    >
                      {/* Room header */}
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <span className="text-lg">{typeMeta.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                value={room.name}
                                onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                                className="flex-1 min-w-[180px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-300"
                                aria-label="Room name"
                              />
                              <select
                                value={room.type}
                                onChange={(e) =>
                                  updateRoom(room.id, {
                                    type: e.target.value,
                                    // A restroom room uses restroomSpec, so default base levels to 0
                                    levels:
                                      e.target.value === "restroom"
                                        ? Object.fromEntries(COMPONENTS.map((c) => [c.key, 0]))
                                        : room.levels,
                                  })
                                }
                                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                                aria-label="Room type"
                              >
                                {ROOM_TYPES.map((t) => (
                                  <option key={t.key} value={t.key}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>

                              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                <Ruler className="h-4 w-4 text-slate-500" />
                                <input
                                  type="number"
                                  value={room.sqft}
                                  onChange={(e) =>
                                    updateRoom(room.id, { sqft: clamp(parseInt(e.target.value || "0", 10), 0, 250000) })
                                  }
                                  className="w-16 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                                  aria-label="Square feet"
                                />
                                <div className="text-xs font-semibold text-slate-500">sf</div>
                              </div>

                              {!isRestroomRoom && (
                                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                                  <span className="text-lg">🚻</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    value={room.restroomCount}
                                    onChange={(e) => updateRoom(room.id, { restroomCount: clamp(parseInt(e.target.value || "0", 10), 0, 2) })}
                                    className="w-12 bg-transparent text-sm font-semibold text-slate-900 outline-none"
                                    aria-label="Number of restrooms"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                              <MiniKey label="Room cost" value={currency(cost)} />
                              <MiniKey label="Cost per sf" value={room.sqft ? `${currency(cpsfRoom)}/sf` : "-"} />
                              <MiniKey label="Allowance" value={currency(450 + 0.35 * room.sqft)} />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeRoom(room.id)}
                          className="inline-flex items-center justify-center self-start rounded-2xl border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                          aria-label="Remove room"
                        >
                          <Trash2 className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Sliders */}
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {isRestroomRoom ? (
                          <ComponentRow
                            title={RESTROOM_COMPONENT.name}
                            helper={RESTROOM_COMPONENT.helper}
                            value={room.restroomSpec}
                            onChange={(v) => updateRoom(room.id, { restroomSpec: v })}
                            costPerSqft={RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 3)]}
                            labelOverride={formatLevelLabel({ key: "restroomSpec" }, room.restroomSpec)}
                          />
                        ) : (
                          COMPONENTS.map((c) => (
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
                                    className="w-20 bg-transparent text-sm font-semibold text-slate-900 outline-none"
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
                                    {currency(RESTROOM_COMPONENT.costs[clamp(room.restroomSpec, 0, 3)])}/sf
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Range value={room.restroomSpec} onChange={(v) => updateRoom(room.id, { restroomSpec: v })} />
                                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>Leave</span>
                                    <span>Basic</span>
                                    <span>Medium</span>
                                    <span>Alpha</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Add room card */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white p-8 flex items-center justify-center">
                <button
                  onClick={addRoom}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-white px-4 py-2 text-sm font-semibold text-emerald-500 shadow-sm hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4" />
                  Add room
                </button>
              </div>
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

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniKey label="Direct (rooms)" value={currency(totals.direct)} />
                <MiniKey label="Design fee" value={currency(totals.design)} />
                <MiniKey label="Escalation" value={currency(totals.escalation)} />
                <MiniKey label="GC O+P" value={currency(totals.gc)} />
                <MiniKey label="Contingency" value={currency(totals.contingency)} />
                <MiniKey label="Rooms" value={rooms.length.toString()} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
                    <BadgeDollarSign className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">Budget</div>
                    <div className="text-sm text-slate-500">Track your project budget</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Set Budget</div>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <BadgeDollarSign className="h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value || "0", 10))}
                    className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
                    aria-label="Project budget"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-sm font-medium text-slate-600">Total Cost</div>
                  <div className="text-sm font-semibold text-slate-900">{currency(totals.grand)}</div>
                </div>
                <div className={`flex items-center justify-between rounded-xl border ${
                  budget - totals.grand >= 0
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-red-200 bg-red-50'
                } px-3 py-2`}>
                  <div className={`text-sm font-medium ${
                    budget - totals.grand >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {budget - totals.grand >= 0 ? 'Remaining' : 'Over Budget'}
                  </div>
                  <div className={`text-sm font-semibold ${
                    budget - totals.grand >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {currency(Math.abs(budget - totals.grand))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget Status</div>
                <div className="mt-2">
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        totals.grand / budget > 1 ? 'bg-red-600' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((totals.grand / budget) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>{((totals.grand / budget) * 100).toFixed(0)}% used</span>
                    <span>{currency(budget)}</span>
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
                    <div className="text-sm font-semibold">{designFeePct}%</div>
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
                    <div className="text-sm font-semibold">{escalationPct}%</div>
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
                    <div className="text-sm font-semibold">{gcOverheadPct}%</div>
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
                    <div className="text-sm font-semibold">{contingencyPct}%</div>
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
            Dummy estimator for UI prototyping. Replace costs and logic with your real model.
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Inputs update totals instantly. Built for quick scenario planning.
          </div>
        </div>
      </div>
    </div>
  );
}
