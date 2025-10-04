import React, { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CakeBase from "./CakeBase";
import Controls from "./Controls";
import { generateCakeImage, transformCakeDataForAPI } from "../../api/gemini";

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

  // AI Generation states
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

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

  // AI Image Generation function
  const handleGenerateAIImage = useCallback(async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);

      const cakeData = getCakeData();
      const apiData = transformCakeDataForAPI(cakeData, {
        // Add any additional selections from the controls if available
        flavor: "vanilla",
        theme: "elegant",
        occasion: "general",
        style: "realistic",
      });

      const result = await generateCakeImage(apiData);

      if (result.success && result.data) {
        setAiGeneratedImage(result.data);
      } else {
        throw new Error(result.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [getCakeData]);

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

        {/* AI Generated Image Display */}
        {aiGeneratedImage && (
          <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">
                🤖 AI Generated Cake
              </h4>
              {aiGeneratedImage.service && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {aiGeneratedImage.service}
                </span>
              )}
            </div>
            <div className="relative">
              {aiGeneratedImage.imageUrl ? (
                <div>
                  <img
                    src={aiGeneratedImage.imageUrl}
                    alt="AI Generated Cake"
                    className="w-full h-64 object-cover rounded-lg shadow-lg border-2 border-purple-200"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ✨ FREE
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow flex items-center justify-center border-2 border-dashed border-purple-300">
                  <div className="text-center text-gray-600">
                    <p className="font-medium">AI Enhanced Prompt Generated</p>
                    <p className="text-sm mt-1">
                      Image generation in progress...
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Generated:</span>
                  <span className="font-medium">
                    {new Date(aiGeneratedImage.generatedAt).toLocaleString()}
                  </span>
                </div>
                {aiGeneratedImage.cost !== undefined && (
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium text-green-600">
                      ${aiGeneratedImage.cost.toFixed(3)} (FREE!)
                    </span>
                  </div>
                )}
                {aiGeneratedImage.note && (
                  <div className="text-center mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                    {aiGeneratedImage.note}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
          onGenerateAI={handleGenerateAIImage}
          isGenerating={isGenerating}
          generationError={generationError}
        />
      </div>
    </div>
  );
}
