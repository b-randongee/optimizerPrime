import React from 'react';
import LocationCard from './LocationCard';

/**
 * Left Sidebar - Master location list
 * Shows demolition + all interior + all exterior spaces as clickable cards
 */
export default function LeftSidebar({
  selectedItemId,
  setSelectedItemId,
  demolitionLocked,
  setDemolitionLocked,
  demolitionCost,
  rooms,
  updateRoom,
  addRoom,
  totals
}) {
  const interiorRooms = rooms.filter(r => !r.isExterior);
  const exteriorRooms = rooms.filter(r => r.isExterior);

  // Helper to get room cost from totals
  const getRoomCost = (roomId) => {
    const roomCostData = totals?.roomCosts?.find(rc => rc.id === roomId);
    return roomCostData?.total || 0;
  };

  return (
    <div className="space-y-4">
      {/* Demolition Section */}
      <div>
        <div className="text-xs font-semibold text-orange-600 px-3 mb-2">
          DEMOLITION
        </div>
        <LocationCard
          id="demolition"
          name="Demolition"
          type="demolition"
          cost={demolitionCost}
          sqft={totals.sqft}
          locked={demolitionLocked}
          selected={selectedItemId === 'demolition'}
          onSelect={() => setSelectedItemId('demolition')}
          onLockToggle={() => setDemolitionLocked(!demolitionLocked)}
        />
      </div>

      {/* Interior Spaces Section */}
      <div>
        <div className="text-xs font-semibold text-emerald-600 px-3 mb-2">
          INTERIOR SPACES
        </div>
        {interiorRooms.length === 0 && (
          <div className="px-3 py-4 mb-2 text-center">
            <p className="text-xs text-slate-500">
              No interior spaces yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first space below to get started.
            </p>
          </div>
        )}
        {interiorRooms.map(room => (
          <LocationCard
            key={room.id}
            id={room.id}
            name={room.name}
            type={room.type}
            cost={getRoomCost(room.id)}
            sqft={room.sqft}
            locked={room.locked}
            selected={selectedItemId === room.id}
            onSelect={() => setSelectedItemId(room.id)}
            onLockToggle={() => updateRoom(room.id, { locked: !room.locked })}
          />
        ))}
        <button
          onClick={() => addRoom(false)}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-3 text-sm font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          + Add Interior Space
        </button>
      </div>

      {/* Exterior Spaces Section */}
      <div>
        <div className="text-xs font-semibold text-blue-600 px-3 mb-2">
          EXTERIOR SPACES
        </div>
        {exteriorRooms.length === 0 && (
          <div className="px-3 py-4 mb-2 text-center">
            <p className="text-xs text-slate-500">
              No exterior spaces yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first space below to get started.
            </p>
          </div>
        )}
        {exteriorRooms.map(room => (
          <LocationCard
            key={room.id}
            id={room.id}
            name={room.name}
            type={room.type}
            cost={getRoomCost(room.id)}
            sqft={room.sqft}
            locked={room.locked}
            selected={selectedItemId === room.id}
            onSelect={() => setSelectedItemId(room.id)}
            onLockToggle={() => updateRoom(room.id, { locked: !room.locked })}
          />
        ))}
        <button
          onClick={() => addRoom(true)}
          className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-3 text-sm font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Exterior Space
        </button>
      </div>
    </div>
  );
}
