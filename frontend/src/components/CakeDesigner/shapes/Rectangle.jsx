import React from "react";
import { Edges } from "@react-three/drei";
import { adjustColorFor3D } from "../../../components/CakeDesigner/utils/colorUtils";

export default function Rectangle({
  radius,
  height,
  color,
  baseY,
  topIcingColor,
  sideIcingColor,
}) {
  const width = radius * 2.4;
  const depth = radius * 1.6;
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
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={adjustedColor} />
        <Edges scale={1.001} color="#6b728080" threshold={15} />
      </mesh>

      {/* Top icing layer */}
      {topIcingColor && (
        <mesh position={[0, baseY + height / 2 + icingThickness / 2, 0]}>
          <boxGeometry
            args={[
              width + icingThickness * 2,
              icingThickness,
              depth + icingThickness * 2,
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
              width + icingThickness * 2,
              height,
              depth + icingThickness * 2,
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
