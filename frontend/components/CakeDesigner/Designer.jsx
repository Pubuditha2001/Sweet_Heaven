import React, { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CakeBase from "./CakeBase";
import Topping from "./Topping";
import Controls from "./Controls";

function Scene({ config, clampRadius, toppings, setToppings, onCanvasReady }) {
  const { gl, scene } = useThree();

  // expose canvas for export
  useFrame(() => {
    if (onCanvasReady) onCanvasReady(gl);
  });

  // No shadow setup

  const handleDrag = useCallback(
    (id, pos) => {
      setToppings((prev) =>
        prev.map((t) => (t.id === id ? { ...t, position: pos } : t))
      );
    },
    [setToppings]
  );

  const handleRemove = useCallback(
    (id) => setToppings((prev) => prev.filter((t) => t.id !== id)),
    [setToppings]
  );

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={1.0} />

      {/* Cake base */}
      <group position={[0, 0, 0]}>
        <CakeBase
          size={config.size}
          color={config.frosting}
          shape={config.shape}
        />
      </group>

      {/* Toppings */}
      {toppings.map((t) => (
        <Topping
          key={t.id}
          id={t.id}
          type={t.type}
          position={t.position}
          color={t.color}
          allowDrag
          onDrag={handleDrag}
          onDoubleClick={handleRemove}
          cakeRadius={config.size.radius}
          clampRadius={clampRadius}
          cakeHeight={config.size.height}
        />
      ))}

      {/* Shadows removed */}

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        makeDefault
        // Keep orbit centered on cake's middle
        target={[0, config.size.height / 2, 0]}
        // Prevent going under the cake; allow top-down views
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={4}
        maxDistance={20}
      />
    </>
  );
}

export default function Designer() {
  const [frosting, setFrosting] = useState("#f5d0e6"); // pink
  const [sizeKey, setSizeKey] = useState("medium");
  const [shapeKey, setShapeKey] = useState("circle");
  const [toppings, setToppings] = useState([]);
  const glRef = useRef(null);

  const sizeMap = useMemo(
    () => ({
      small: { radius: 2, height: 1.5 },
      medium: { radius: 3, height: 2 },
      large: { radius: 4, height: 2.5 },
    }),
    []
  );

  const config = useMemo(
    () => ({ size: sizeMap[sizeKey], frosting, shape: shapeKey }),
    [sizeKey, sizeMap, frosting, shapeKey]
  );

  const clampRadius = useMemo(() => {
    const { radius } = config.size;
    const margin = 0.2;
    switch (shapeKey) {
      case "circle":
        return Math.max(0.1, radius - margin);
      case "oval": {
        const rx = radius * 1.4;
        const rz = radius * 0.9;
        return Math.max(0.1, Math.min(rx, rz) - margin);
      }
      case "square": {
        const side = radius * 2;
        return Math.max(0.1, side / 2 - margin);
      }
      case "rectangle": {
        const w = radius * 2.4;
        const d = radius * 1.6;
        return Math.max(0.1, Math.min(w / 2, d / 2) - margin);
      }
      case "hexagon":
        return Math.max(0.1, radius * 0.866 - margin);
      case "heart":
        return Math.max(0.1, radius * 0.75 - margin);
      default:
        return Math.max(0.1, radius - margin);
    }
  }, [config.size, shapeKey]);

  const addTopping = useCallback(
    (type) => {
      // Single-instance layer types: prevent duplicates
      const singletons = new Set([
        "chocolateDrip",
        "topGlaze",
        "creamRing",
        "sprinkles",
      ]);
      if (singletons.has(type)) {
        const exists = toppings.some((t) => t.type === type);
        if (exists) return;
      }
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      // Defaults by type
      let defaultColor = "#ffffff";
      if (type === "cherry") defaultColor = "#c81e1e";
      else if (type === "strawberry") defaultColor = "#ef4444";
      else if (type === "candle") defaultColor = "#ffd166";
      else if (type === "chocolateDrip") defaultColor = "#5b341a";
      else if (type === "topGlaze") defaultColor = frosting;
      else if (type === "creamRing") defaultColor = "#ffffff";
      else if (type === "sprinkles") defaultColor = "#ffffff";

      const baseY = config.size.height + 0.1;
      const isLayer = [
        "chocolateDrip",
        "topGlaze",
        "creamRing",
        "sprinkles",
      ].includes(type);
      const newItem = {
        id,
        type,
        color: defaultColor,
        // Layers compute absolute world Y internally; keep group at origin
        position: isLayer ? [0, 0, 0] : [0, baseY, 0],
      };
      setToppings((prev) => [...prev, newItem]);
    },
    [config.size.height, toppings, frosting]
  );

  const handleExport = useCallback(() => {
    if (!glRef.current) return;
    const dataURL = glRef.current.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "custom-cake.png";
    a.click();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 3D Preview */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
        {/* Use a fixed height so we don't depend on Tailwind v3 aspect utilities */}
        <div className="w-full" style={{ height: "60vh", minHeight: 360 }}>
          <Canvas
            camera={{ position: [6, 6, 6], fov: 45 }}
            onCreated={({ gl }) => {
              // Ensure correct color space and shadows
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.shadowMap.enabled = false;
              gl.toneMapping = THREE.NoToneMapping;
              gl.toneMappingExposure = 1;
            }}
          >
            <Scene
              config={{ size: config.size, frosting, shape: config.shape }}
              clampRadius={clampRadius}
              toppings={toppings}
              setToppings={setToppings}
              onCanvasReady={(gl) => (glRef.current = gl)}
            />
          </Canvas>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
        <Controls
          sizeKey={sizeKey}
          onSizeChange={setSizeKey}
          shapeKey={shapeKey}
          onShapeChange={setShapeKey}
          frosting={frosting}
          onFrostingChange={setFrosting}
          onAddTopping={addTopping}
          onExport={handleExport}
          toppings={toppings}
          onRemoveTopping={(id) =>
            setToppings((prev) => prev.filter((t) => t.id !== id))
          }
        />
      </div>
    </div>
  );
}
