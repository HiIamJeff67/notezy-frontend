import { ThreeCord } from "@/global/types/threeCord.type";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const Lantern = ({ position }: { position: ThreeCord }) => {
  const lanternRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={lanternRef} position={position}>
        {/* 燈籠主體 */}
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#FF4500" transparent opacity={0.7} />
        </mesh>
        {/* 燈籠頂部 */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 0.3, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* 燈籠底部 */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.5, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* 內部光源 */}
        <pointLight intensity={2} color="#FFFF00" />
      </group>
    </Float>
  );
};

export default Lantern;
