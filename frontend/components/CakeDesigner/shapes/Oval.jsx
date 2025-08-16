import React from "react";
import { Edges } from "@react-three/drei";
import { adjustColorFor3D } from "../utils/colorUtils";

export default function Oval({
  radius,
  height,
  color,
  baseY,
  segments,
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
      <mesh position={[0, baseY, 0]} scale={[1.4, 1, 0.9]}>
        <cylinderGeometry args={[radius, radius, height, segments]} />
        <meshBasicMaterial color={adjustedColor} />
        <Edges scale={1.002} color="#6b728080" threshold={15} />
      </mesh>

      {/* Top icing layer */}
      {topIcingColor && (
        <mesh
          position={[0, baseY + height / 2 + icingThickness / 2, 0]}
          scale={[1.4, 1, 0.9]}
        >
          <cylinderGeometry
            args={[
              radius + icingThickness,
              radius + icingThickness,
              icingThickness,
              segments,
            ]}
          />
          <meshBasicMaterial color={adjustedTopIcing} />
        </mesh>
      )}

      {/* Side icing layer */}
      {sideIcingColor && (
        <mesh position={[0, baseY, 0]} scale={[1.4, 1, 0.9]}>
          <cylinderGeometry
            args={[
              radius + icingThickness,
              radius + icingThickness,
              height,
              segments,
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
