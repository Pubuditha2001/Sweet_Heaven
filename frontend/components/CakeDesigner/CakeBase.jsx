import React, { useMemo } from "react";
import { Edges } from "@react-three/drei";

// Import shape components
import Circle from "./shapes/Circle";
import Oval from "./shapes/Oval";
import Square from "./shapes/Square";
import Rectangle from "./shapes/Rectangle";
import Hexagon from "./shapes/Hexagon";
import Heart from "./shapes/Heart";

export default function CakeBase({
  size,
  color,
  shape = "circle",
  topIcingColor,
  sideIcingColor,
}) {
  const { radius, height } = size;
  const segments = 64;

  // Plate constants and base Y so cake rests on plate
  const plateHeight = 0.04;
  const plateY = 0.02;
  const plateTop = plateY + plateHeight / 2; // 0.04
  const baseY = plateTop + height / 2;

  // Geometry per shape
  const body = (() => {
    switch (shape) {
      case "oval":
        return (
          <Oval
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            segments={segments}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
      case "square":
        return (
          <Square
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
      case "rectangle":
        return (
          <Rectangle
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
      case "hexagon":
        return (
          <Hexagon
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
      case "heart":
        return (
          <Heart
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
      default:
        return (
          <Circle
            radius={radius}
            height={height}
            color={color}
            baseY={baseY}
            segments={segments}
            topIcingColor={topIcingColor}
            sideIcingColor={sideIcingColor}
          />
        );
    }
  })();

  // Plate: keep circular plate sized to largest footprint
  const plateSize = useMemo(() => {
    switch (shape) {
      case "oval":
        return radius * 1.4 + 1;
      case "square":
        return radius * 2 + 1;
      case "rectangle":
        return radius * 2.4 + 1;
      case "hexagon":
        return radius + 1;
      case "heart":
        return radius * 2 + 1;
      default:
        return radius + 1;
    }
  }, [shape, radius]);

  return (
    <group>
      {body}
      <mesh position={[0, plateY, 0]}>
        <cylinderGeometry args={[plateSize, plateSize, plateHeight, 96]} />
        <meshBasicMaterial color="#e5e7eb" />
        <Edges scale={1.002} color="#9ca3af" threshold={20} />
      </mesh>
    </group>
  );
}
