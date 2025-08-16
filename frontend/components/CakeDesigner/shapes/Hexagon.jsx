import React from "react";
import { Edges } from "@react-three/drei";
import { adjustColorFor3D } from "../utils/colorUtils";

export default function Hexagon({
  radius,
  height,
  color,
  baseY,
  topIcingColor,
  sideIcingColor,
}) {
  const adjustedColor = adjustColorFor3D(color);
  const adjustedTopIcing = topIcingColor
    ? adjustColorFor3D(topIcingColor)
    : null;
  const adjustedSideIcing = sideIcingColor
    ? adjustColorFor3D(sideIcingColor)
    : null;

  const icingThickness = 0.02;

  return (
    <group>
      {/* Base cake */}
      <mesh position={[0, baseY, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius, height, 6]} />
        <meshBasicMaterial color={adjustedColor} />
        <Edges scale={1.002} color="#6b728080" threshold={15} />
      </mesh>

      {/* Top icing layer */}
      {topIcingColor && (
        <mesh
          position={[0, baseY + height / 2 + icingThickness / 2, 0]}
          rotation={[0, 0, 0]}
        >
          <cylinderGeometry
            args={[
              radius + icingThickness,
              radius + icingThickness,
              icingThickness,
              6,
            ]}
          />
          <meshBasicMaterial color={adjustedTopIcing} />
        </mesh>
      )}

      {/* Side icing layer */}
      {sideIcingColor && (
        <mesh position={[0, baseY, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry
            args={[radius + icingThickness, radius + icingThickness, height, 6]}
          />
          <meshBasicMaterial
            color={adjustedSideIcing}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
