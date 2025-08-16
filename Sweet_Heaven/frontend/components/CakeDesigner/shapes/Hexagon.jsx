import React from "react";
import { Edges } from "@react-three/drei";

export default function Hexagon({ radius, height, color }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[radius, radius, height, 6]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.002} color="#6b728080" threshold={15} />
    </mesh>
  );
}