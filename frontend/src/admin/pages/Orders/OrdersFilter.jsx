import React from "react";

export default function OrdersFilter({ query, onQueryChange, onClear }) {
  return (
    <div className="mb-6">
      <div className="flex items-stretch gap-3">
        <div className="flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by order ID, customer name or phone"
            className="w-full px-4 py-2 border bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-700"
          />
        </div>
        <div className="shrink-0">
          <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
