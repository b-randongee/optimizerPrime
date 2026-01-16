import React from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DemolitionEditor from './DemolitionEditor';
import RoomEditor from './RoomEditor';

// ROOM_TYPES for dropdown display
const ROOM_TYPES = [
  { key: "breakroom", label: "Break Room", icon: "☕", isExterior: false },
  { key: "conferenceroom", label: "Conference Room", icon: "💼", isExterior: false },
  { key: "hallway", label: "Hallway", icon: "🚶", isExterior: false },
  { key: "learningroom", label: "Learning Room", icon: "📚", isExterior: false },
  { key: "limitlessroom", label: "Limitless Room", icon: "🔬", isExterior: false },
  { key: "multipurpose", label: "Multi-Purpose Room", icon: "🎭", isExterior: false },
  { key: "office", label: "Office", icon: "💻", isExterior: false },
  { key: "reception", label: "Reception Area", icon: "🏢", isExterior: false },
  { key: "restroom", label: "Restroom", icon: "🚻", isExterior: false },
  { key: "rocketroom", label: "Rocket Room", icon: "🚀", isExterior: false },
  { key: "storage", label: "Storage", icon: "📦", isExterior: false },
  // Exterior spaces
  { key: "playground", label: "Playground", icon: "🛝", isExterior: true },
  { key: "parking", label: "Parking Lot", icon: "🚗", isExterior: true },
  { key: "landscape", label: "Landscaping", icon: "🌳", isExterior: true },
  { key: "signage", label: "Signage", icon: "🪧", isExterior: true },
];

/**
 * Middle Editor - dynamic content based on left sidebar selection
 * Shows DemolitionEditor, RoomEditor, or empty state
 */
export default function MiddleEditor({
  selectedItemId,
  setSelectedItemId,
  rooms,
  updateRoom,
  removeRoom,
  demolitionLevels,
  setDemolitionLevels,
  demolitionLocked,
  totals
}) {
  const selectedRoom = rooms.find(r => r.id === selectedItemId);
  const isDemolition = selectedItemId === 'demolition';

  return (
    <div className="space-y-6">
      {/* Mobile Room Selector - only visible on mobile */}
      <div className="lg:hidden">
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="demolition">🔨 Demolition</option>
          <optgroup label="Interior Spaces">
            {rooms.filter(r => !r.isExterior).map(room => {
              const roomType = ROOM_TYPES.find(rt => rt.key === room.type);
              return (
                <option key={room.id} value={room.id}>
                  {roomType?.icon || '📦'} {room.name}
                </option>
              );
            })}
          </optgroup>
          <optgroup label="Exterior Spaces">
            {rooms.filter(r => r.isExterior).map(room => {
              const roomType = ROOM_TYPES.find(rt => rt.key === room.type);
              return (
                <option key={room.id} value={room.id}>
                  {roomType?.icon || '🌳'} {room.name}
                </option>
              );
            })}
          </optgroup>
        </select>
      </div>

      {/* How to use card */}
      <div className="rounded-2xl bg-slate-100 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-slate-900">How to use this dashboard</div>
            <div className="text-xs text-slate-600 mt-1 space-y-1">
              <p>• Select spaces to customize below, then choose quality levels for each component</p>
              <p>• Lock section to collapse it and freeze costs while exploring other options</p>
              <p>• Adjust global assumptions in the sidebar to see real-time cost updates</p>
              <p>• Export your final configuration to PDF using the button in the sidebar</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-300">
              <div className="text-xs font-semibold text-slate-700">Keyboard Shortcuts</div>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <p>• <span className="font-mono bg-slate-200 px-1 rounded">↑</span> or <span className="font-mono bg-slate-200 px-1 rounded">k</span> - Previous room</p>
                <p>• <span className="font-mono bg-slate-200 px-1 rounded">↓</span> or <span className="font-mono bg-slate-200 px-1 rounded">j</span> - Next room</p>
                <p>• <span className="font-mono bg-slate-200 px-1 rounded">Esc</span> - Return to demolition</p>
                <p>• <span className="font-mono bg-slate-200 px-1 rounded">Cmd/Ctrl+S</span> - Export PDF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic content based on selection with animations */}
      <AnimatePresence mode="wait">
        {isDemolition && (
          <motion.div
            key="demolition"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <DemolitionEditor
              demolitionLevels={demolitionLevels}
              setDemolitionLevels={setDemolitionLevels}
              demolitionLocked={demolitionLocked}
              totalCost={totals.demolition}
            />
          </motion.div>
        )}

        {selectedRoom && (
          <motion.div
            key={selectedRoom.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <RoomEditor
              room={selectedRoom}
              updateRoom={updateRoom}
              removeRoom={removeRoom}
              totals={totals}
              isExterior={selectedRoom.isExterior}
            />
          </motion.div>
        )}

        {!selectedRoom && !isDemolition && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-slate-400 text-sm">
                Select a space from the left sidebar to edit
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
