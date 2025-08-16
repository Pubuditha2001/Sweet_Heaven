import React from "react";

const SIZE_OPTIONS = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
];

const SHAPE_OPTIONS = [
  { key: "circle", label: "Circle" },
  { key: "oval", label: "Oval" },
  { key: "square", label: "Square" },
  { key: "rectangle", label: "Rectangle" },
  { key: "hexagon", label: "Hexagon" },
  { key: "heart", label: "Heart" },
];

const FROSTING_COLORS = [
  { name: "Pink", value: "#f5d0e6" },
  { name: "White", value: "#ffffff" },
  { name: "Chocolate", value: "#7b3f00" },
  { name: "Mint", value: "#c7f9cc" },
  { name: "Sky", value: "#bae6fd" },
];

export default function Controls({
  sizeKey,
  onSizeChange,
  shapeKey,
  onShapeChange,
  frosting,
  onFrostingChange,
  onAddTopping,
  onExport,
  toppings,
  onRemoveTopping,
}) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Cake Shape</h3>
        <div className="flex flex-wrap gap-2">
          {SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onShapeChange(opt.key)}
              className={`px-3 py-1.5 rounded border text-sm transition ${
                shapeKey === opt.key
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Cake Size</h3>
        <div className="flex gap-2">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSizeChange(opt.key)}
              className={`px-3 py-1.5 rounded border text-sm transition ${
                sizeKey === opt.key
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Frosting Color</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {FROSTING_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => onFrostingChange(c.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                frosting === c.value ? "border-pink-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
          <input
            type="color"
            value={frosting}
            onChange={(e) => onFrostingChange(e.target.value)}
            className="w-10 h-8 p-0 border rounded"
            aria-label="Custom frosting color"
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Toppings</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onAddTopping("cherry")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Cherry
          </button>
          <button
            onClick={() => onAddTopping("strawberry")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Strawberry
          </button>
          <button
            onClick={() => onAddTopping("candle")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Candle
          </button>
        </div>

        {toppings?.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm text-gray-600 mb-1">Placed</h4>
            <ul className="space-y-1 max-h-40 overflow-auto pr-1">
              {toppings.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize">{t.type}</span>
                  <button
                    onClick={() => onRemoveTopping(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Layers</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddTopping("chocolateDrip")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Chocolate Drip
          </button>
          <button
            onClick={() => onAddTopping("topGlaze")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Top Glaze
          </button>
          <button
            onClick={() => onAddTopping("creamRing")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Cream Swirls
          </button>
          <button
            onClick={() => onAddTopping("sprinkles")}
            className="px-3 py-1.5 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            + Sprinkles
          </button>
        </div>
      </section>

      <div className="pt-2">
        <button
          onClick={onExport}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded"
        >
          Export Screenshot
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Tip: Double-click a topping in 3D to remove.
        </p>
      </div>
    </div>
  );
}
