import React, { useMemo } from "react";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

export default function Heart({ radius, height, color }) {
  const HEART_TUNING = {
    curveSegments: 100,
    heightScale: 0.45,
    lengthScale: 0.45,
    bottomTaper: 0.7,
    straightFrac: 0.12,
  };

  const heartGeom = useMemo(() => {
    const pts = [];
    const N = Math.max(64, Math.floor(radius * 8));
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push(new THREE.Vector2(x, y * HEART_TUNING.heightScale));
    }

    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const hRange = Math.max(1e-6, maxY - minY);
    const remap = (y) => (y - minY) / hRange;
    const smooth = (a) => a * a * (3 - 2 * a);

    const spts = pts.map((p) => {
      const n = smooth(remap(p.y));
      const f = HEART_TUNING.bottomTaper + (1 - HEART_TUNING.bottomTaper) * n;
      return new THREE.Vector2(p.x * f, p.y);
    });

    let minY2 = Infinity, maxY2 = -Infinity;
    for (const p of spts) {
      if (p.y < minY2) minY2 = p.y;
      if (p.y > maxY2) maxY2 = p.y;
    }
    const yTh = minY2 + (maxY2 - minY2) * HEART_TUNING.straightFrac;

    const topPoints = [];
    let topIdx = 0;
    let maxYVal = -Infinity;
    for (let i = 0; i < spts.length; i++) {
      if (spts[i].y > maxYVal) {
        maxYVal = spts[i].y;
        topIdx = i;
      }
    }

    for (let i = topIdx; ; i = (i + 1) % spts.length) {
      if (spts[i].y <= yTh) break;
      topPoints.push(spts[i]);
      if (i === (topIdx - 1 + spts.length) % spts.length) break;
    }

    const leftArc = [];
    for (let i = (topIdx - 1 + spts.length) % spts.length; ; i = (i - 1 + spts.length) % spts.length) {
      if (spts[i].y <= yTh) break;
      leftArc.push(spts[i]);
      if (i === topIdx) break;
    }
    topPoints.unshift(...leftArc.reverse());

    const leftBottom = spts.filter((p) => p.x < 0).reduce((acc, p) => (p.y < acc.y ? p : acc), spts[0]);
    const rightBottom = spts.filter((p) => p.x > 0).reduce((acc, p) => (p.y < acc.y ? p : acc), spts[0]);
    const tip = new THREE.Vector2(0, minY2);

    const shape = new THREE.Shape();
    if (topPoints.length >= 2) {
      shape.moveTo(topPoints[0].x, topPoints[0].y);
      if (topPoints.length > 2) shape.splineThru(topPoints.slice(1));
      else shape.lineTo(topPoints[1].x, topPoints[1].y);

      shape.lineTo(rightBottom.x, rightBottom.y);
      shape.lineTo(tip.x, tip.y);
      shape.lineTo(leftBottom.x, leftBottom.y);
      shape.closePath();
    } else {
      shape.moveTo(spts[0].x, spts[0].y);
      if (spts.length > 1) shape.splineThru(spts.slice(1));
      shape.closePath();
    }

    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      curveSegments: Math.max(8, Math.floor(radius * 2)),
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(-Math.PI / 2);
    geom.center();
    const s = (radius * 2) / 32;
    geom.scale(s, 1, HEART_TUNING.lengthScale);
    if (geom.computeVertexNormals) geom.computeVertexNormals();
    return geom;
  }, [radius, height]);

  return (
    <mesh>
      <primitive object={heartGeom} attach="geometry" />
      <meshBasicMaterial color={color} />
      <Edges scale={1.002} color="#6b728080" threshold={15} />
    </mesh>
  );
}