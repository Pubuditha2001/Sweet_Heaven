import React, { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CakeBase from "./CakeBase";
import Controls from "./Controls";

function Scene({ config, onCanvasReady }) {
  const { gl } = useThree();

  // expose canvas for export
  useFrame(() => {
    if (onCanvasReady) onCanvasReady(gl);
  });

  return (
    <>
      {/* Optimized lighting for color accuracy */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.6}
        color="#ffffff"
        castShadow={false}
      />
      <pointLight position={[-5, 8, -3]} intensity={0.3} color="#ffffff" />

      {/* Cake base with icing layers */}
      <group position={[0, 0, 0]}>
        <CakeBase
          size={config.size}
          color={config.frosting}
          topIcingColor={config.topIcing}
          sideIcingColor={config.sideIcing}
          shape={config.shape}
        />
      </group>

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
  const [frosting, setFrosting] = useState("#f5d0e6"); // base cake color
  const [topIcing, setTopIcing] = useState("#ffffff"); // top icing color
  const [sideIcing, setSideIcing] = useState("#ffc0cb"); // side icing color
  const [sizeKey, setSizeKey] = useState("medium");
  const [shapeKey, setShapeKey] = useState("circle");
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
    () => ({
      size: sizeMap[sizeKey],
      frosting,
      topIcing,
      sideIcing,
      shape: shapeKey,
    }),
    [sizeKey, sizeMap, frosting, topIcing, sideIcing, shapeKey]
  );

  const handleExport = useCallback(() => {
    if (!glRef.current) return;
    const dataURL = glRef.current.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "custom-cake.png";
    a.click();
  }, []);

  // Get cake data for external use
  const getCakeData = useCallback(() => {
    return {
      size: sizeKey,
      shape: shapeKey,
      baseColor: frosting,
      topIcingColor: topIcing,
      sideIcingColor: sideIcing,
      dimensions: config.size,
    };
  }, [sizeKey, shapeKey, frosting, topIcing, sideIcing, config.size]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 3D Preview */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
        {/* Use a fixed height so we don't depend on Tailwind v3 aspect utilities */}
        <div className="w-full" style={{ height: "60vh", minHeight: 360 }}>
          <Canvas
            camera={{ position: [6, 6, 6], fov: 45 }}
            onCreated={({ gl }) => {
              // Maximum color accuracy settings
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.toneMapping = THREE.NoToneMapping;
              gl.toneMappingExposure = 1.0;
              gl.shadowMap.enabled = false;

              // Enhanced color accuracy
              gl.gammaFactor = 2.2;
              gl.physicallyCorrectLights = false; // Keeps lighting predictable
              gl.antialias = true;

              // Ensure consistent color rendering
              gl.setClearColor(0xf8f9fa, 1); // Light background for better color perception
            }}
          >
            <Scene
              config={config}
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
          topIcing={topIcing}
          onTopIcingChange={setTopIcing}
          sideIcing={sideIcing}
          onSideIcingChange={setSideIcing}
          onExport={handleExport}
          getCakeData={getCakeData}
        />
      </div>
    </div>
  );
}
