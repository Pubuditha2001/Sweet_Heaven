import React, { useMemo } from "react";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import Circle from "./shapes/Circle";
import Oval from "./shapes/Oval";
import Square from "./shapes/Square";
import Rectangle from "./shapes/Rectangle";
import Hexagon from "./shapes/Hexagon";
import Heart from "./shapes/Heart";

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
    // Build parametric heart outline in normalized units (independent of cake height)
    const pts = [];
    // resolution scales with radius so small/large cakes keep consistent outline
    const N = Math.max(64, Math.floor(radius * 8));
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
    // Build a deterministic outline: smooth top arc (left -> right), then
    // two straight lines from right-bottom -> tip -> left-bottom.
    // Collect topPoints in contour order by walking outwards from the global top
    let topIdx = 0;
    let maxYVal = -Infinity;
    for (let i = 0; i < spts.length; i++) {
      if (spts[i].y > maxYVal) {
        maxYVal = spts[i].y;
        topIdx = i;
      }
    }
    const topPoints = [];
    // walk right from topIdx
    for (let i = topIdx; ; i = (i + 1) % spts.length) {
      if (spts[i].y <= yTh) break;
      topPoints.push(spts[i]);
      if (i === (topIdx - 1 + spts.length) % spts.length) break; // safety
    }
    // walk left from topIdx-1 backwards and prepend
    const leftArc = [];
    for (
      let i = (topIdx - 1 + spts.length) % spts.length;
      ;
      i = (i - 1 + spts.length) % spts.length
    ) {
      if (spts[i].y <= yTh) break;
      leftArc.push(spts[i]);
      if (i === topIdx) break; // safety
    }
    topPoints.unshift(...leftArc.reverse());
    // Lowest point among left-side and right-side for straight connection
    const leftBottom = spts
      .filter((p) => p.x < 0)
      .reduce((acc, p) => (p.y < acc.y ? p : acc), spts[0]);
    const rightBottom = spts
      .filter((p) => p.x > 0)
      .reduce((acc, p) => (p.y < acc.y ? p : acc), spts[0]);
    const tip = new THREE.Vector2(0, minY2);

    const shape = new THREE.Shape();
    if (topPoints.length >= 2) {
      // Smooth top arc
      shape.moveTo(topPoints[0].x, topPoints[0].y);
      if (topPoints.length > 2) shape.splineThru(topPoints.slice(1));
      else shape.lineTo(topPoints[1].x, topPoints[1].y);

      // Straight down to right-bottom, to tip, then to left-bottom, and close
      shape.lineTo(rightBottom.x, rightBottom.y);
      shape.lineTo(tip.x, tip.y);
      shape.lineTo(leftBottom.x, leftBottom.y);
      shape.closePath();
    } else {
      // fallback: smooth whole boundary
      shape.moveTo(spts[0].x, spts[0].y);
      if (spts.length > 1) shape.splineThru(spts.slice(1));
      shape.closePath();
    }

    const extrudeSettings = {
      depth: height, // keep extrusion (thickness) tied to cake height only
      bevelEnabled: false,
      curveSegments: Math.max(8, Math.floor(radius * 2)),
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Align, center, and scale to width = 2*radius
    geom.rotateX(-Math.PI / 2);
    geom.center();
    const s = (radius * 2) / 32; // original parametric width ~[-16,16]
    // scale X to match width, keep Y (vertical) at extrude depth (height), scale Z for length
    geom.scale(s, 1, HEART_TUNING.lengthScale);
    // recompute normals after non-uniform scale to avoid shading artifacts
    if (geom.computeVertexNormals) geom.computeVertexNormals();
    return geom;
  }, [radius, height]);

  // Geometry per shape
  const body = (() => {
    switch (shape) {
      case "oval":
        return <Oval size={size} color={color} baseY={baseY} />;
      case "square":
        return <Square size={size} color={color} baseY={baseY} />;
      case "rectangle":
        return <Rectangle size={size} color={color} baseY={baseY} />;
      case "hexagon":
        return <Hexagon size={size} color={color} baseY={baseY} />;
      case "heart":
        return (
          <mesh position={[0, baseY, 0]}>
            <primitive object={heartGeom} attach="geometry" />
            <meshBasicMaterial color={color} />
            <Edges scale={1.002} color="#6b728080" threshold={15} />
          </mesh>
        );
      default:
        return <Circle size={size} color={color} baseY={baseY} />;
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