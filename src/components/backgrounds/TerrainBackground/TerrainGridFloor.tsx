import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 baseColor;
  uniform vec3 alternateColor;
  uniform vec3 fogColor;
  uniform float fogEnd;
  uniform float fogStart;
  uniform vec3 lineColor;
  uniform float gridSize;
  uniform vec2 fogCenter;
  varying vec3 vWorldPosition;

  void main() {
    vec2 grid = vWorldPosition.xz * gridSize / 520.0;
    vec2 cell = fract(grid);
    float checker = mod(floor(grid.x) + floor(grid.y), 2.0);
    float edge = smoothstep(0.48, 0.5, max(abs(cell.x - 0.5), abs(cell.y - 0.5)));
    vec3 tileColor = mix(baseColor, alternateColor, checker * 0.38);
    vec3 gridColor = mix(tileColor, lineColor, edge * 0.48);
    float fog = smoothstep(fogStart, fogEnd, distance(vWorldPosition.xz, fogCenter));

    gl_FragColor = vec4(mix(gridColor, fogColor, fog), 1.0);
  }
`;

export const TerrainGridFloor = ({ isDark }: { isDark: boolean }) => {
  const uniforms = useMemo(
    () => ({
      alternateColor: {
        value: new THREE.Color(isDark ? "#020202" : "#fdfdfd"),
      },
      baseColor: { value: new THREE.Color(isDark ? "#000000" : "#ffffff") },
      fogCenter: { value: new THREE.Vector2(0, -28) },
      fogColor: { value: new THREE.Color(isDark ? "#000000" : "#ffffff") },
      fogEnd: { value: 230 },
      fogStart: { value: 95 },
      gridSize: { value: 120 },
      lineColor: {
        value: new THREE.Color(isDark ? "#aeb7be" : "#555c62"),
      },
    }),
    [isDark]
  );

  return (
    <mesh
      position={[0, -6.35, -28]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-1}
    >
      <planeGeometry args={[520, 520]} />
      <shaderMaterial
        depthWrite
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
};
