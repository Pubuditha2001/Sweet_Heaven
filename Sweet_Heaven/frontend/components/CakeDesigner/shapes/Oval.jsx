import React from "react";
import { Edges } from "@react-three/drei";

export default function Oval({ radius, height, color }) {
  const segments = 64;
  const baseY = height / 2;

  return (
    <mesh position={[0, baseY, 0]} scale={[1.4, 1, 0.9]}>
      <cylinderGeometry args={[radius, radius, height, segments]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.002} color="#6b728080" threshold={15} />
    </mesh>
  );
}