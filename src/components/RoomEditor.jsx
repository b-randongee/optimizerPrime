import React from 'react';
import { Trash2, Ruler } from 'lucide-react';
import costsData from '../costs.json';

// Constants from costs.json
const COMPONENTS = costsData.interiorComponents;
const RESTROOM_COMPONENT = costsData.restroomComponent;
const EXTERIOR_COMPONENT = costsData.exteriorComponent;

const LEVELS = [
  { value: 0, label: "As-Is", tone: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: 1, label: "Refresh", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: 2, label: "Upgrade", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: 3, label: "Alpha", tone: "bg-blue-50 text-blue-700 border-blue-200" },
];

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

// Helper functions
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

function levelMeta(v) {
  return LEVELS.find((x) => x.value === v) || LEVELS[0];
}

function getApplicableComponents(roomType) {
  return COMPONENTS.filter(c =>
    !c.appliesTo || c.appliesTo === "all" || c.appliesTo.includes(roomType)
  );
}

function formatLevelLabel(component, value) {
  if (component.key === "restroomSpec") {
    return RESTROOM_COMPONENT.levels.find((x) => x.value === value)?.label || "As-Is";
  }
  if (component.key === "exteriorSpec") {
    return EXTERIOR_COMPONENT.levels.find((x) => x.value === value)?.label || "As-Is";
  }
  return levelMeta(value).label;
}

// Helper components
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

/**
 * Room Editor component - shows all room editing controls
 * No lock button (controlled from left sidebar)
 * Dynamic border color based on interior/exterior
 */
export default function RoomEditor({
  room,
  updateRoom,
  removeRoom,
  totals,
  isExterior
}) {
  const typeMeta = ROOM_TYPES.find((t) => t.key === room.type) || ROOM_TYPES[0];

  // Calculate room cost (using same logic as App.jsx totals calculation)
  // For simplicity, we'll accept cost from parent via totals
  const cost = totals?.roomCosts?.find(rc => rc.id === room.id)?.total || 0;
  const cpsfRoom = room.sqft > 0 ? cost / room.sqft : 0;

  const isRestroomRoom = room.type === "restroom";
  const isExteriorSpace = room.isExterior;
  const showEmbeddedRestroom = !isRestroomRoom && !isExteriorSpace && room.restroomCount > 0;

  const borderColor = isExteriorSpace ? 'border-blue-500' : 'border-emerald-500';

  return (
    <div className={`rounded-3xl border-2 ${borderColor} bg-slate-50 p-5`}>
      {/* Room header */}
      <div className="flex items-start gap-3">
        {/* Left column: Icon, Trash */}
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
    </div>
  );
}
