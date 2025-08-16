import React from "react";
import { adjustColorFor3D } from "../utils/colorUtils";

export default function ChocolateDrip({
  id,
  color = "#5b341a",
  cakeRadius,
  cakeHeight,
}) {
  const adjustedColor = adjustColorFor3D(color);

  // A small band around top edge with slight irregular edge using a torus and thin outer rim
  const bandY = cakeHeight + 0.05; // absolute world Y at cake top edge

  return (
    <group position={[0, bandY, 0]}>
      {/* thin top band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[cakeRadius - 0.05, 0.06, 16, 128]} />
        <meshBasicMaterial color={adjustedColor} />
      </mesh>
      {/* slight drip hints as small capsules */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const x = Math.cos(ang) * (cakeRadius - 0.15);
        const z = Math.sin(ang) * (cakeRadius - 0.15);
        const len = 0.12 + (i % 3) * 0.04;
        return (
          <mesh key={i} position={[x, -len / 2, z]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, len, 10]} />
            <meshBasicMaterial color={adjustedColor} />
          </mesh>
        );
      })}
    </group>
  );
}
