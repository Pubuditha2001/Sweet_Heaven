import React, { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Edges } from "@react-three/drei";

function clampToTop(radius, height, x, z) {
  const r = Math.sqrt(x * x + z * z);
  if (r > radius - 0.2) {
    const scale = (radius - 0.2) / r;
    return [x * scale, height + 0.1, z * scale];
  }
  return [x, height + 0.1, z];
}

function Cherry({ color = "#c81e1e" }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 12]} />
        <meshStandardMaterial color="#14532d" />
      </mesh>
    </group>
  );
}

function Strawberry({ color = "#ef4444" }) {
  return (
    <group>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.5, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* leaves */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 6]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
}

function Candle({ color = "#ffd166" }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* wick */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      {/* flame */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.05, 0.12, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function ChocolateDrip({ radius, height, color = "#5b341a" }) {
  // A small band around top edge with slight irregular edge using a torus and thin outer rim
  const bandY = height + 0.05; // absolute world Y at cake top edge
  return (
    <group position={[0, bandY, 0]}>
      {/* thin top band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius - 0.05, 0.06, 16, 128]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* slight drip hints as small capsules */}
      {Array.from({ length: 12 }).map((_, i) => {
        const ang = (i / 12) * Math.PI * 2;
        const x = Math.cos(ang) * (radius - 0.15);
        const z = Math.sin(ang) * (radius - 0.15);
        const len = 0.12 + (i % 3) * 0.04;
        return (
          <mesh key={i} position={[x, -len / 2, z]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, len, 10]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function TopGlaze({ radius, height, color }) {
  // Thin disc on top surface, slightly inset from edge
  const y = height + 0.015; // absolute world Y slightly above top
  return (
    <mesh position={[0, y, 0]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[radius - 0.1, radius - 0.1, 0.03, 64]} />
      <meshBasicMaterial color={color} />
      <Edges scale={1.002} color="#6b7280" threshold={25} />
    </mesh>
  );
}

function CreamRing({ radius, height, color = "#ffffff" }) {
  // Repeated small swirls placed in a ring
  const y = height + 0.1; // absolute world Y at top
  const count = 12;
  const r = radius - 0.25;
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
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.1, 0.14, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Sprinkles({ radius, height }) {
  const y = height + 0.13;
  const colors = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];
  const items = 60;
  return (
    <group>
      {Array.from({ length: items }).map((_, i) => {
        const ang = Math.random() * Math.PI * 2;
        const r = (radius - 0.3) * Math.sqrt(Math.random());
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        const rot = Math.random() * Math.PI;
        const len = 0.06 + Math.random() * 0.04;
        const c = colors[i % colors.length];
        return (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, rot, 0]}>
            <cylinderGeometry args={[0.01, 0.01, len, 6]} />
            <meshBasicMaterial color={c} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Topping({
  id,
  type,
  position = [0, 0, 0],
  color,
  allowDrag = true,
  onDrag,
  onDoubleClick,
  cakeRadius,
  clampRadius,
  cakeHeight,
}) {
  const ref = useRef();
  const { camera } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const handlePointerDown = useCallback(
    (e) => {
      if (!allowDrag) return;
      e.stopPropagation();
      e.target.setPointerCapture(e.pointerId);
    },
    [allowDrag]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!allowDrag || !e.target.hasPointerCapture(e.pointerId)) return;
      e.stopPropagation();
      // Intersect the event ray with a plane at the cake's top
      plane.current.constant = -(cakeHeight + 0.1);
      const point = new THREE.Vector3();
      e.ray.intersectPlane(plane.current, point);
      const r = clampRadius ?? cakeRadius;
      const [nx, ny, nz] = clampToTop(r, cakeHeight, point.x, point.z);
      ref.current.position.set(nx, ny, nz);
      onDrag && onDrag(id, [nx, ny, nz]);
    },
    [allowDrag, onDrag, id, cakeRadius, cakeHeight]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (!allowDrag) return;
      e.stopPropagation();
      if (e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
    },
    [allowDrag]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onDoubleClick && onDoubleClick(id);
    },
    [id, onDoubleClick]
  );

  const isLayer =
    type === "chocolateDrip" ||
    type === "topGlaze" ||
    type === "creamRing" ||
    type === "sprinkles";

  // Only free toppings are draggable; layers are fixed and ignore pointer handlers
  const groupProps = isLayer
    ? { position: [0, 0, 0] }
    : {
        position,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onDoubleClick: handleDoubleClick,
      };

  return (
    <group ref={ref} {...groupProps}>
      {type === "cherry" && <Cherry color={color} />}
      {type === "strawberry" && <Strawberry color={color} />}
      {type === "candle" && <Candle color={color} />}
      {type === "chocolateDrip" && (
        <ChocolateDrip radius={cakeRadius} height={cakeHeight} color={color} />
      )}
      {type === "topGlaze" && (
        <TopGlaze radius={cakeRadius} height={cakeHeight} color={color} />
      )}
      {type === "creamRing" && (
        <CreamRing radius={cakeRadius} height={cakeHeight} color={color} />
      )}
      {type === "sprinkles" && (
        <Sprinkles radius={cakeRadius} height={cakeHeight} />
      )}
    </group>
  );
}
