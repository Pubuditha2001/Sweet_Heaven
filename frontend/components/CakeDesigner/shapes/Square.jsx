import React from "react";
import { Edges } from "@react-three/drei";

export default function Square({ radius, height, color, baseY }) {
  const side = radius * 2;
  return (
    <mesh position={[0, baseY, 0]}>
      <boxGeometry args={[side, height, side]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.001} color="#6b728080" threshold={15} />
    </mesh>
  );
}
