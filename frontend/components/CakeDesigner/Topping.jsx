import React, { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Import individual components
import Cherry from "./toppings/Cherry";
import Strawberry from "./toppings/Strawberry";
import Candle from "./toppings/Candle";
import BirthdayCandles from "./toppings/BirthdayCandles";
import SandwichCookie from "./toppings/SandwichCookie";
import ChocolateDrip from "./layers/ChocolateDrip";
import TopGlaze from "./layers/TopGlaze";
import CreamRing from "./layers/CreamRing";
import Sprinkles from "./layers/Sprinkles";

function clampToTop(radius, height, x, z) {
  const r = Math.sqrt(x * x + z * z);
  if (r > radius - 0.2) {
    const scale = (radius - 0.2) / r;
    return [x * scale, height + 0.1, z * scale];
  }
  return [x, height + 0.1, z];
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
      {type === "cherry" && (
        <Cherry
          id={id}
          position={isLayer ? [0, 0, 0] : position}
          color={color}
          allowDrag={allowDrag}
          onDrag={onDrag}
          onDoubleClick={onDoubleClick}
        />
      )}
      {type === "strawberry" && (
        <Strawberry
          id={id}
          position={isLayer ? [0, 0, 0] : position}
          color={color}
          allowDrag={allowDrag}
          onDrag={onDrag}
          onDoubleClick={onDoubleClick}
        />
      )}
      {type === "candle" && (
        <Candle
          id={id}
          position={isLayer ? [0, 0, 0] : position}
          color={color}
          allowDrag={allowDrag}
          onDrag={onDrag}
          onDoubleClick={onDoubleClick}
        />
      )}
      {type === "birthdayCandles" && (
        <BirthdayCandles
          id={id}
          position={isLayer ? [0, 0, 0] : position}
          color={color}
          allowDrag={allowDrag}
          onDrag={onDrag}
          onDoubleClick={onDoubleClick}
        />
      )}
      {type === "sandwichCookie" && (
        <SandwichCookie
          id={id}
          position={isLayer ? [0, 0, 0] : position}
          color={color}
          allowDrag={allowDrag}
          onDrag={onDrag}
          onDoubleClick={onDoubleClick}
        />
      )}
      {type === "chocolateDrip" && (
        <ChocolateDrip
          id={id}
          color={color}
          cakeRadius={cakeRadius}
          cakeHeight={cakeHeight}
        />
      )}
      {type === "topGlaze" && (
        <TopGlaze
          id={id}
          color={color}
          cakeRadius={cakeRadius}
          cakeHeight={cakeHeight}
        />
      )}
      {type === "creamRing" && (
        <CreamRing
          id={id}
          color={color}
          cakeRadius={cakeRadius}
          cakeHeight={cakeHeight}
        />
      )}
      {type === "sprinkles" && (
        <Sprinkles
          id={id}
          color={color}
          cakeRadius={cakeRadius}
          cakeHeight={cakeHeight}
        />
      )}
    </group>
  );
}
