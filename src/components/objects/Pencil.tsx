import { ThreeCord } from "@/global/types/threeCord.type";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export const Pencil = ({ position }: { position: ThreeCord }) => {
  const pencilRef = useRef<THREE.Group>(null);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={pencilRef} position={position} rotation={[0, 0, Math.PI / 6]}>
        {/* 鉛筆主體 */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* 鉛筆尖 */}
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.05, 0.2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* 橡皮擦 */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
      </group>
    </Float>
  );
};
