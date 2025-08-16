import React from "react";
import { Edges } from "@react-three/drei";
import { adjustColorFor3D } from "../utils/colorUtils";

export default function Square({
  radius,
  height,
  color,
  baseY,
  topIcingColor,
  sideIcingColor,
}) {
  const side = radius * 2;
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
      <mesh position={[0, baseY, 0]}>
        <boxGeometry args={[side, height, side]} />
        <meshBasicMaterial color={adjustedColor} />
        <Edges scale={1.001} color="#6b728080" threshold={15} />
      </mesh>

      {/* Top icing layer */}
      {topIcingColor && (
        <mesh position={[0, baseY + height / 2 + icingThickness / 2, 0]}>
          <boxGeometry
            args={[
              side + icingThickness * 2,
              icingThickness,
              side + icingThickness * 2,
            ]}
          />
          <meshBasicMaterial color={adjustedTopIcing} />
        </mesh>
      )}

      {/* Side icing layer */}
      {sideIcingColor && (
        <mesh position={[0, baseY, 0]}>
          <boxGeometry
            args={[
              side + icingThickness * 2,
              height,
              side + icingThickness * 2,
            ]}
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
