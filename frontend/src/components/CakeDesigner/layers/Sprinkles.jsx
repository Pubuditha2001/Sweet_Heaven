import React from "react";
import { adjustColorFor3D } from "../../../../components/CakeDesigner/utils/colorUtils";

export default function Sprinkles({ id, color, cakeRadius, cakeHeight }) {
  const y = cakeHeight + 0.13;
  const colors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];
  const items = 60;

  return (
    <group>
      {Array.from({ length: items }).map((_, i) => {
        const ang = Math.random() * Math.PI * 2;
        const r = (cakeRadius - 0.3) * Math.sqrt(Math.random());
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        const rot = Math.random() * Math.PI;
        const len = 0.06 + Math.random() * 0.04;
        const c = colors[i % colors.length];
        const adjustedColor = adjustColorFor3D(c);
        return (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, rot, 0]}>
            <cylinderGeometry args={[0.01, 0.01, len, 6]} />
            <meshBasicMaterial color={adjustedColor} />
          </mesh>
        );
      })}
    </group>
  );
}
