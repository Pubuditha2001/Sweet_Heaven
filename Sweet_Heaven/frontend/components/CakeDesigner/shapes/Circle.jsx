import React from "react";
import { Edges } from "@react-three/drei";

export default function Circle({ radius, height, color }) {
  const segments = 64;
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[radius, radius, height, segments]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.002} color="#6b728080" threshold={15} />
    </mesh>
  );
}