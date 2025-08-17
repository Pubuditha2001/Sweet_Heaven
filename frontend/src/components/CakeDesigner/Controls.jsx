import React, { useState } from "react";

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
  { name: "Vanilla", value: "#fff8dc" },
  { name: "Strawberry", value: "#ffb3ba" },
];

const ICING_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Pink", value: "#ffc0cb" },
  { name: "Blue", value: "#add8e6" },
  { name: "Yellow", value: "#ffffe0" },
  { name: "Green", value: "#98fb98" },
  { name: "Purple", value: "#dda0dd" },
];

export default function Controls({
  sizeKey,
  onSizeChange,
  shapeKey,
  onShapeChange,
  frosting,
  onFrostingChange,
  topIcing,
  onTopIcingChange,
  sideIcing,
  onSideIcingChange,
  onExport,
  getCakeData,
}) {
  const [customSelections, setCustomSelections] = useState({
    cakeType: false,
    flavor: false,
    frostingType: false,
    frostingStyle: false,
    toppings: false,
    decorativeAccents: false,
    arrangement: false,
  });

  const handleSelectChange = (field, value) => {
    setCustomSelections((prev) => ({
      ...prev,
      [field]: value === "custom",
    }));
  };

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
        <h3 className="font-semibold text-gray-800 mb-2">Base Cake Color</h3>
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
        <h3 className="font-semibold text-gray-800 mb-2">Top Icing Color</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {ICING_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => onTopIcingChange(c.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                topIcing === c.value ? "border-pink-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
          <input
            type="color"
            value={topIcing}
            onChange={(e) => onTopIcingChange(e.target.value)}
            className="w-10 h-8 p-0 border rounded"
            aria-label="Custom top icing color"
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Side Icing Color</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {ICING_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => onSideIcingChange(c.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                sideIcing === c.value ? "border-pink-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
          <input
            type="color"
            value={sideIcing}
            onChange={(e) => onSideIcingChange(e.target.value)}
            className="w-10 h-8 p-0 border rounded"
            aria-label="Custom side icing color"
          />
        </div>
      </section>

      {/* Cake Foundation */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">1. Cake Foundation</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cake Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              onChange={(e) => handleSelectChange("cakeType", e.target.value)}
            >
              <option value="">-- Select Cake Type --</option>
              <option value="layer-cake">Layer Cake</option>
              <option value="cupcake">Cupcake</option>
              <option value="cheesecake">Cheesecake</option>
              <option value="roll-cake">Roll Cake</option>
            </select>
            {customSelections.cakeType && (
              <input
                type="text"
                placeholder="Custom cake type"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shape
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Shape --</option>
              <option>Round</option>
              <option>Square</option>
              <option>Heart</option>
              <option>Doll</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Size --</option>
              <option>Cup cake</option>
              <option>Bento</option>
              <option>Small (500g)</option>
              <option>Medium (1Kg)</option>
              <option>Large (2-5Kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flavor (Visual)
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              onChange={(e) => handleSelectChange("flavor", e.target.value)}
            >
              <option value="">-- Select Flavor --</option>
              <option value="chocolate">Chocolate</option>
              <option value="vanilla">Vanilla</option>
              <option value="red-velvet">Red Velvet</option>
              <option value="funfetti">Funfetti</option>
              <option value="lemon">Lemon</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.flavor && (
              <input
                type="text"
                placeholder="Custom flavor"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Layers
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Layers --</option>
              <option>Single-layer</option>
              <option>2 layers</option>
              <option>3 layers</option>
            </select>
          </div>
        </div>
      </section>

      {/* Frosting & Icing */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">
          2. Frosting & Icing
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frosting Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              onChange={(e) =>
                handleSelectChange("frostingType", e.target.value)
              }
            >
              <option value="">-- Select Frosting Type --</option>
              <option value="buttercream">Buttercream</option>
              <option value="fondant">Fondant</option>
              <option value="whipped-cream">Whipped Cream</option>
              <option value="ganache">Ganache</option>
              <option value="glaze">Glaze</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.frostingType && (
              <input
                type="text"
                placeholder="Custom frosting type"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frosting Color
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2">
              <option value="">-- Select Frosting Color --</option>
              <option>Pink</option>
              <option>Blue</option>
              <option>White</option>
              <option>Green</option>
            </select>
            <input
              type="color"
              className="w-full h-10 p-0 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frosting Style
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              onChange={(e) =>
                handleSelectChange("frostingStyle", e.target.value)
              }
            >
              <option value="">-- Select Frosting Style --</option>
              <option value="smooth">Smooth</option>
              <option value="textured">Textured (Swirls)</option>
              <option value="naked">Naked Cake</option>
              <option value="drip">Drip</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.frostingStyle && (
              <input
                type="text"
                placeholder="Custom frosting style"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>
        </div>
      </section>

      {/* Toppings & Decorations */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">
          3. Toppings & Decorations
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Toppings
            </label>
            <select
              multiple
              className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 mb-2"
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleSelectChange("toppings", values.includes("custom"));
              }}
            >
              <option value="strawberries">Strawberries</option>
              <option value="cherries">Cherries</option>
              <option value="flowers">Flowers (e.g., Rose)</option>
              <option value="sprinkles">Sprinkles</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.toppings && (
              <input
                type="text"
                placeholder="Custom toppings"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decorative Accents
            </label>
            <select
              multiple
              className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 mb-2"
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                handleSelectChange(
                  "decorativeAccents",
                  values.includes("custom")
                );
              }}
            >
              <option value="edible-pearls">Edible Pearls</option>
              <option value="crushed-oreos">Crushed Oreos</option>
              <option value="chocolate-shavings">Chocolate Shavings</option>
              <option value="macarons">Macarons</option>
              <option value="silver-dust">Silver Dust</option>
              <option value="edible-glitter">Edible Glitter</option>
              <option value="fondant-figures">Fondant Figures</option>
              <option value="candles">Candles</option>
              <option value="ribbons">Ribbons</option>
              <option value="cake-topper">Cake Topper</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.decorativeAccents && (
              <input
                type="text"
                placeholder="Custom decorative accents"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topping Arrangement
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
              onChange={(e) =>
                handleSelectChange("arrangement", e.target.value)
              }
            >
              <option value="">-- Select Arrangement --</option>
              <option value="clustered">Clustered on top</option>
              <option value="scattered">Scattered</option>
              <option value="around-base">Around the base</option>
              <option value="cascading">Cascading down the side</option>
              <option value="custom">Custom</option>
            </select>
            {customSelections.arrangement && (
              <input
                type="text"
                placeholder="Custom arrangement"
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </div>
        </div>
      </section>

      {/* Presentation & Setting */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">
          4. Presentation & Setting
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cake Stand
            </label>
            <input
              type="text"
              defaultValue="White Ceramic Plate"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lighting
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Lighting --</option>
              <option>Soft Ambient Light</option>
              <option>Dramatic Shadows</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Camera Angle
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Camera Angle --</option>
              <option>Front-facing</option>
              <option>Top-down</option>
              <option>Side-view</option>
              <option>Close-up</option>
            </select>
          </div>
        </div>
      </section>

      {/* Image Style */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">5. Image Style</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overall Style
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">-- Select Style --</option>
            <option>Photorealistic</option>
          </select>
        </div>
      </section>

      {/* Occasion */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">6. Occasion</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occasion
          </label>
          <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
            <option value="">-- Select Occasion --</option>
            <option>Party</option>
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Gift</option>
            <option>Love</option>
            <option>Retirement</option>
          </select>
        </div>
      </section>

      {/* Theme */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">7. Theme</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option value="">-- Select Theme --</option>
              <option>On Love</option>
              <option>Caring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Movie Character Theme
            </label>
            <input
              type="text"
              placeholder="Enter movie character theme"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </section>

      {/* Generate Prompt */}
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Generate AI Prompt</h3>

        <div className="space-y-3">
          <button
            id="generatePromptBtn"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded border border-purple-600 hover:bg-purple-700 transition"
          >
            Generate AI Prompt
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated Prompt
            </label>
            <textarea
              id="generatedPrompt"
              rows="8"
              className="w-full p-3 border border-gray-300 rounded-md text-sm resize-vertical"
              placeholder="Generated AI prompt will appear here..."
              readOnly
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Export & Data</h3>
        <div className="space-y-2">
          <button
            onClick={onExport}
            className="w-full px-4 py-2 bg-pink-600 text-white rounded border border-pink-600 hover:bg-pink-700 transition"
          >
            Export Image
          </button>
          <button
            onClick={() => {
              const data = getCakeData();
              console.log("Cake Data:", data);
              alert(
                `Cake Configuration:\nSize: ${data.size}\nShape: ${data.shape}\nBase: ${data.baseColor}\nTop Icing: ${data.topIcingColor}\nSide Icing: ${data.sideIcingColor}`
              );
            }}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded border border-gray-600 hover:bg-gray-700 transition"
          >
            Get Cake Data
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Simplified cake designer - visualize shape and icing colors only.
        </p>
      </section>
    </div>
  );
}
