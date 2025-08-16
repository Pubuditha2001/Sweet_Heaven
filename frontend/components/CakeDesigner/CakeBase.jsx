import React, { useMemo } from "react";
import { Edges } from "@react-three/drei";

export default function CakeBase({ size, color, shape = "circle" }) {
  const { radius, height } = size;
  const segments = 64;

  // Geometry per shape
  const body = (() => {
    switch (shape) {
      case "circle":
        return (
          <mesh position={[0, height / 2, 0]}>
            <cylinderGeometry args={[radius, radius, height, segments]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      case "oval": {
        // Scale X/Z of circle to get oval footprint
        const rx = radius * 1.4;
        const rz = radius * 0.9;
        return (
          <mesh
            position={[0, height / 2, 0]}
            scale={[rx / radius, 1, rz / radius]}
          >
            <cylinderGeometry args={[radius, radius, height, segments]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "square": {
        const side = radius * 2;
        return (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[side, height, side]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.001} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "rectangle": {
        const width = radius * 2.4;
        const depth = radius * 1.6;
        return (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.001} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "hexagon": {
        return (
          <mesh position={[0, height / 2, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[radius, radius, height, 6]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "heart": {
        // Approximate heart top as two cylinders + bottom as cone, merged visually
        const r = radius * 0.75;
        const offset = r;
        return (
          <group position={[0, height / 2, 0]}>
            {/* two lobes */}
            <mesh position={[-offset / 2, 0, 0]}>
              <cylinderGeometry args={[r, r, height, segments]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[offset / 2, 0, 0]}>
              <cylinderGeometry args={[r, r, height, segments]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* bottom point */}
            <mesh
              position={[0, -height / 2 + height * 0.6, 0]}
              rotation={[Math.PI, 0, 0]}
            >
              <coneGeometry args={[radius, height * 1.2, segments]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Edges scale={1.003} color="#6b728080" threshold={15} />
          </group>
        );
      }
      default:
        return (
          <mesh position={[0, height / 2, 0]}>
            <cylinderGeometry args={[radius, radius, height, segments]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
    }
  })();

  // Plate: keep circular plate sized to largest footprint
  const plateSize = useMemo(() => {
    switch (shape) {
      case "oval":
        return radius * 1.4 + 1;
      case "square":
        return radius * 2 + 1;
      case "rectangle":
        return radius * 2.4 + 1;
      case "hexagon":
        return radius + 1;
      case "heart":
        return radius * 2 + 1;
      default:
        return radius + 1;
    }
  }, [shape, radius]);

  return (
    <group>
      {body}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[plateSize, plateSize, 0.04, 96]} />
        <meshBasicMaterial color="#e5e7eb" />
        <Edges scale={1.002} color="#9ca3af" threshold={20} />
      </mesh>
    </group>
  );
}
