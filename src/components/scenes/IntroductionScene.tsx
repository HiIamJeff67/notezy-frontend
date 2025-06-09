import { Environment, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Lantern from "../objects/Lantern";
import { OpenBook } from "../objects/OpenBook";
import { Pencil } from "../objects/Pencil";

const IntroductionScene = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />

          {/* 環境光 */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* 環境反射 */}
          <Environment preset="dawn" />

          {/* 3D 物件 */}
          <Pencil position={[-4, 2, -2]} />
          <Lantern position={[4, 1, -3]} />
          <OpenBook position={[2, -3, 1]} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default IntroductionScene;
