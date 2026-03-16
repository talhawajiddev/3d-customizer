"use client";

import { useMemo } from "react";
import { Color } from "three";

import type { DesignConfiguration } from "@/lib/utils/designs";

type ConfiguredModelProps = {
  design: DesignConfiguration;
};

export function ConfiguredModel({ design }: ConfiguredModelProps) {
  const color = useMemo(() => new Color(design.color), [design.color]);
  const seatDepth = design.productType === "sofa" ? 2.8 : design.productType === "chair" ? 1.3 : 2.4;
  const seatWidth = design.productType === "sofa" ? 4.2 : design.productType === "chair" ? 1.6 : 3.8;
  const backHeight = design.productType === "table" ? 0.1 : design.productType === "chair" ? 1.9 : 1.6;
  const legHeight = design.productType === "table" ? 1.9 : 0.8;
  const topY = design.productType === "table" ? 1.85 : 0.8;

  return (
    <group>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[seatWidth, 0.45, seatDepth]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>

      {design.productType !== "table" && (
        <mesh position={[0, topY + 0.65, -seatDepth / 2 + 0.15]} castShadow>
          <boxGeometry args={[seatWidth, backHeight, 0.35]} />
          <meshStandardMaterial color={color.clone().multiplyScalar(0.9)} roughness={0.75} />
        </mesh>
      )}

      {design.productType === "sofa" && (
        <>
          <mesh position={[-seatWidth / 2 + 0.15, topY + 0.35, 0]} castShadow>
            <boxGeometry args={[0.3, 1, seatDepth]} />
            <meshStandardMaterial color={color.clone().multiplyScalar(0.85)} roughness={0.8} />
          </mesh>
          <mesh position={[seatWidth / 2 - 0.15, topY + 0.35, 0]} castShadow>
            <boxGeometry args={[0.3, 1, seatDepth]} />
            <meshStandardMaterial color={color.clone().multiplyScalar(0.85)} roughness={0.8} />
          </mesh>
        </>
      )}

      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <mesh
          key={`${x}-${z}`}
          position={[
            (seatWidth / 2 - 0.28) * x,
            legHeight / 2,
            (seatDepth / 2 - 0.28) * z
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.12, 0.14, legHeight, 24]} />
          <meshStandardMaterial
            color={design.legFinish === "oak" ? "#d6b58c" : design.legFinish === "walnut" ? "#6b4226" : "#111827"}
            roughness={0.6}
            metalness={design.legFinish === "matte-black" ? 0.5 : 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
