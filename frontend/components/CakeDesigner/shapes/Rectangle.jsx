import React from "react";
import { Edges } from "@react-three/drei";

export default function Rectangle({ radius, height, color, baseY }) {
  const width = radius * 2.4;
  const depth = radius * 1.6;
  return (
    <mesh position={[0, baseY, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.001} color="#6b728080" threshold={15} />
    </mesh>
  );
}
