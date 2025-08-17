import React from "react";
import { Edges } from "@react-three/drei";
import { adjustColorFor3D } from "../../../../components/CakeDesigner/utils/colorUtils";

export default function TopGlaze({ id, color, cakeRadius, cakeHeight }) {
  const adjustedColor = adjustColorFor3D(color);

  // Thin disc on top surface, slightly inset from edge
  const y = cakeHeight + 0.015; // absolute world Y slightly above top

  return (
    <mesh position={[0, y, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[cakeRadius - 0.1, cakeRadius - 0.1, 0.03, 64]} />
      <meshBasicMaterial color={adjustedColor} />
      <Edges scale={1.002} color="#6b7280" threshold={25} />
    </mesh>
  );
}
