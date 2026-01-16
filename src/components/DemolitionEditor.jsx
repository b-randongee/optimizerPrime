import React from 'react';
import costsData from '../costs.json';

const DEMOLITION_COMPONENTS = costsData.demolitionComponents;
const DEMOLITION_LEVEL_LABELS = ["None", "Minor", "Moderate", "Extreme", "Complete"];

// Currency formatter
const currency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Level metadata for styling
function levelMeta(level) {
  const meta = [
    { label: "As-Is", tone: "bg-slate-100 text-slate-700 border-slate-200" },
    { label: "Refresh", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Upgrade", tone: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Alpha", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  ];
  return meta[level] || meta[0];
}

// Format label for demolition components
function formatDemolitionLabel(value) {
  return DEMOLITION_LEVEL_LABELS[value] || "None";
}

// SegPill component
function SegPill({ text, tone }) {
  return (
    <div className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {text}
    </div>
  );
}

// Range slider component
function Range({ value, onChange, max = 3, disabled = false }) {
  return (
    <input
      type="range"
      min="0"
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      disabled={disabled}
      className="w-full"
    />
  );
}

// Component Row for each demolition component
function ComponentRow({ title, helper, value, onChange, costPerSqft, max, disabled }) {
  const meta = levelMeta(value);
  const text = formatDemolitionLabel(value);

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
          {DEMOLITION_LEVEL_LABELS.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Demolition editor component - shows 6 demolition sliders
 * No lock button (controlled from left sidebar)
 */
export default function DemolitionEditor({
  demolitionLevels,
  setDemolitionLevels,
  demolitionLocked,
  totalCost
}) {
  return (
    <div className="rounded-3xl border-2 border-orange-500 bg-slate-50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <span className="text-lg">💥</span>
          </div>
          <div>
            <div className="text-base font-semibold text-orange-600">Demolition</div>
            <div className="text-sm text-slate-500">{currency(totalCost)}</div>
          </div>
        </div>
      </div>

      {/* 6 Demolition Component Sliders */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {DEMOLITION_COMPONENTS.map((comp) => (
          <ComponentRow
            key={comp.key}
            title={comp.name}
            helper={comp.helper}
            value={demolitionLevels[comp.key]}
            onChange={(v) => setDemolitionLevels(prev => ({ ...prev, [comp.key]: v }))}
            costPerSqft={comp.costs[demolitionLevels[comp.key]]}
            max={4}
            disabled={demolitionLocked}
          />
        ))}
      </div>
    </div>
  );
}
