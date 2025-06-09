// components/objects/OpenBook.tsx
"use client";

import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export const OpenBook = ({
  position,
}: {
  position: [number, number, number];
}) => {
  const bookRef = useRef<THREE.Group>(null);

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={bookRef} position={position} rotation={[0, Math.PI / 4, 0]}>
        {/* 書本封底 */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[3, 2, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* 左頁面 - 提高 Y 座標避免穿透 */}
        <group position={[-0.75, 0.15, 0]} rotation={[0, 0, -0.2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <meshStandardMaterial color="#FFF8DC" />
          </mesh>

          {/* 左頁文字行 */}
          {[0.6, 0.4, 0.2, 0, -0.2, -0.4].map((y, index) => (
            <mesh
              key={index}
              position={[0, 0.03, y]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <boxGeometry args={[1, 0.02, 0.01]} />
              <meshStandardMaterial color="#666" />
            </mesh>
          ))}
        </group>

        {/* 右頁面 - 提高 Y 座標避免穿透 */}
        <group position={[0.75, 0.15, 0]} rotation={[0, 0, 0.2]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <meshStandardMaterial color="#FFF8DC" />
          </mesh>

          {/* 右頁文字行 */}
          {[0.6, 0.4, 0.2, 0, -0.2, -0.4].map((y, index) => (
            <mesh
              key={index}
              position={[0, 0.03, y]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <boxGeometry args={[1, 0.02, 0.01]} />
              <meshStandardMaterial color="#666" />
            </mesh>
          ))}
        </group>

        {/* 書脊/裝訂處 - 調整高度 */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.1, 2, 0.15]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>

        {/* 書籤絲帶 - 調整位置 */}
        <mesh position={[0, 0.25, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.05, 1, 0.005]} />
          <meshStandardMaterial color="#DC143C" />
        </mesh>

        {/* 頁面邊緣陰影 - 調整高度 */}
        <mesh position={[-0.05, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.02, 1.8, 0.08]} />
          <meshStandardMaterial color="#E5E5DC" />
        </mesh>

        <mesh position={[0.05, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.02, 1.8, 0.08]} />
          <meshStandardMaterial color="#E5E5DC" />
        </mesh>
      </group>
    </Float>
  );
};
