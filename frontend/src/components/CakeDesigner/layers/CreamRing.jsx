import React from "react";
import { adjustColorFor3D } from "../../../../components/CakeDesigner/utils/colorUtils";

export default function CreamRing({
  id,
  color = "#ffffff",
  cakeRadius,
  cakeHeight,
}) {
  const adjustedColor = adjustColorFor3D(color);

  // Repeated small swirls placed in a ring
  const y = cakeHeight + 0.1; // absolute world Y at top
  const count = 12;
  const r = cakeRadius - 0.25;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const ang = (i / count) * Math.PI * 2;
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, -ang, 0]}>
            <mesh>
              <coneGeometry args={[0.15, 0.18, 16]} />
              <meshBasicMaterial color={adjustedColor} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.1, 0.14, 16]} />
              <meshBasicMaterial color={adjustedColor} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
