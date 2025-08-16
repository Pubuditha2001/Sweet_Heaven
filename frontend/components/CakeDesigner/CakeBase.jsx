import React, { useMemo } from "react";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

export default function CakeBase({ size, color, shape = "circle" }) {
  const { radius, height } = size;
  const segments = 64;

  // Plate constants and base Y so cake rests on plate
  const plateHeight = 0.04;
  const plateY = 0.02;
  const plateTop = plateY + plateHeight / 2; // 0.04
  const baseY = plateTop + height / 2;

  // Tuning parameters for heart outline
  const HEART_TUNING = {
    curveSegments: 100, // smoothness of the 2D outline
    heightScale: 0.45, // vertical stretch/squash of the 2D outline (Y in shape plane)
    lengthScale: 0.45, // front-to-back length after extrusion (Z)
    bottomTaper: 0.7, // 0.6..1.0 — <1 straightens sides near the tip
    straightFrac: 0.12, // 0..1 — how high the straight edges start from the tip
  };

  // Proper extruded heart geometry (unconditional hook usage)
  const heartGeom = useMemo(() => {
    // Parametric heart outline with optional taper near the tip to straighten sides
    const pts = [];
    const N = HEART_TUNING.curveSegments * 2;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2; // 0..2PI
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      pts.push(new THREE.Vector2(x, y * HEART_TUNING.heightScale));
    }
    // y-dependent x scaling: near the tip (minY) shrink width to bottomTaper
    let minY = Infinity,
      maxY = -Infinity;
    for (const p of pts) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const hRange = Math.max(1e-6, maxY - minY);
    const remap = (y) => (y - minY) / hRange; // 0 at tip, 1 at top
    const smooth = (a) => a * a * (3 - 2 * a);

    // Precompute tapered points
    const spts = pts.map((p) => {
      const n = smooth(remap(p.y));
      const f = HEART_TUNING.bottomTaper + (1 - HEART_TUNING.bottomTaper) * n;
      return new THREE.Vector2(p.x * f, p.y);
    });
    // Find vertical range and threshold for straight tip
    let minY2 = Infinity,
      maxY2 = -Infinity;
    for (const p of spts) {
      if (p.y < minY2) minY2 = p.y;
      if (p.y > maxY2) maxY2 = p.y;
    }
    const yTh = minY2 + (maxY2 - minY2) * HEART_TUNING.straightFrac;
    // Find indices where we enter bottom zone on left and exit on right
    let iLeft = -1,
      iRight = -1;
    for (let i = 0; i < spts.length; i++) {
      const p = spts[i];
      if (p.y <= yTh && p.x < 0) {
        iLeft = i;
        break;
      }
    }
    for (let i = spts.length - 1; i >= 0; i--) {
      const p = spts[i];
      if (p.y <= yTh && p.x > 0) {
        iRight = i;
        break;
      }
    }
    const shape = new THREE.Shape();
    if (iLeft !== -1 && iRight !== -1 && iLeft < iRight) {
      const tip = new THREE.Vector2(0, minY2);
      // Start from top
      shape.moveTo(spts[0].x, spts[0].y);
      for (let i = 1; i <= iLeft; i++) shape.lineTo(spts[i].x, spts[i].y);
      // Straight to tip and then to right side start
      shape.lineTo(tip.x, tip.y);
      shape.lineTo(spts[iRight].x, spts[iRight].y);
      for (let i = iRight + 1; i < spts.length; i++)
        shape.lineTo(spts[i].x, spts[i].y);
      shape.closePath();
    } else {
      // Fallback: original path
      shape.moveTo(spts[0].x, spts[0].y);
      for (let i = 1; i < spts.length; i++) shape.lineTo(spts[i].x, spts[i].y);
      shape.closePath();
    }

    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      curveSegments: HEART_TUNING.curveSegments,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Align, center, and scale to width = 2*radius
    geom.rotateX(-Math.PI / 2);
    geom.center();
    const s = (radius * 2) / 32; // original parametric width ~[-16,16]
    geom.scale(s, s, HEART_TUNING.lengthScale);
    return geom;
  }, [radius, height]);

  // Geometry per shape
  const body = (() => {
    switch (shape) {
      case "oval": {
        return (
          <mesh position={[0, baseY, 0]} scale={[1.4, 1, 0.9]}>
            <cylinderGeometry args={[radius, radius, height, segments]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "square": {
        const side = radius * 2;
        return (
          <mesh position={[0, baseY, 0]}>
            <boxGeometry args={[side, height, side]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.001} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "rectangle": {
        const width = radius * 2.4;
        const depth = radius * 1.6;
        return (
          <mesh position={[0, baseY, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.001} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "hexagon": {
        return (
          <mesh position={[0, baseY, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[radius, radius, height, 6]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      case "heart": {
        return (
          <mesh position={[0, baseY, 0]}>
            <primitive object={heartGeom} attach="geometry" />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      }
      default:
        return (
          <mesh position={[0, baseY, 0]}>
            <cylinderGeometry args={[radius, radius, height, segments]} />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
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
