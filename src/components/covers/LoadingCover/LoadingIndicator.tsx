import { useId, useMemo } from "react";

const CHART_WIDTH = 256;
const CHART_HEIGHT = 132;
const WAVE_SAMPLES = 180;
const GRID_X = 12;
const GRID_Y = 12;
const GRID_WIDTH = 232;
const GRID_HEIGHT = 108;
const BASE_LINE = 66;

const generateWave = (
  amplitude: number,
  cycles: number,
  phaseShift = 0
): string => {
  const span = GRID_WIDTH * 2;
  const points: string[] = [];

  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const ratio = i / WAVE_SAMPLES;
    const localX = ratio * span;
    const xRatio = localX / GRID_WIDTH;
    const theta = xRatio * Math.PI * 2;
    const x = GRID_X + localX;
    const y = BASE_LINE + Math.sin(theta * cycles + phaseShift) * amplitude;

    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `M ${points.join(" L ")}`;
};

const LoadingIndicator = () => {
  const id = useId().replace(/[:]/g, "");
  const gridId = `${id}-grid`;
  const clipId = `${id}-clip`;
  const waveConfig = useMemo(() => {
    return {
      primaryAmplitude: 18 + Math.random() * (24 - 18),
      secondaryAmplitude: 12 + Math.random() * (18 - 12),
      primaryCycles: Math.floor(2 + Math.random() * 3),
      secondaryCycles: Math.floor(4 + Math.random() * 4),
      primaryPhase: Math.random() * Math.PI * 2,
      secondaryPhase: Math.random() * Math.PI * 2,
      primaryDuration: 2.8 + Math.random() * (3.6 - 2.8),
      secondaryDuration: 3.8 + Math.random() * (5 - 3.8),
    };
  }, []);

  const primaryWavePath = useMemo(
    () =>
      generateWave(
        waveConfig.primaryAmplitude,
        waveConfig.primaryCycles,
        waveConfig.primaryPhase
      ),
    [waveConfig]
  );
  const secondaryWavePath = useMemo(
    () =>
      generateWave(
        waveConfig.secondaryAmplitude,
        waveConfig.secondaryCycles,
        waveConfig.secondaryPhase
      ),
    [waveConfig]
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        aria-hidden="true"
        className="mb-4 h-[148px] w-[288px]"
      >
        <defs>
          <pattern
            id={gridId}
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke="var(--loading-wave-brown-muted)"
              strokeWidth="1"
            />
          </pattern>
          <clipPath id={clipId}>
            <rect
              x={GRID_X}
              y={GRID_Y}
              width={GRID_WIDTH}
              height={GRID_HEIGHT}
            />
          </clipPath>
        </defs>
        <rect
          x={GRID_X}
          y={GRID_Y}
          width={GRID_WIDTH}
          height={GRID_HEIGHT}
          fill={`url(#${gridId})`}
        />
        <line
          x1="22"
          y1="16"
          x2="22"
          y2="116"
          stroke="var(--loading-wave-brown)"
          strokeWidth="1.4"
        />
        <line
          x1={GRID_X}
          y1={BASE_LINE}
          x2={GRID_X + GRID_WIDTH}
          y2={BASE_LINE}
          stroke="var(--loading-wave-brown)"
          strokeWidth="1.4"
        />
        <g clipPath={`url(#${clipId})`}>
          <path
            d={primaryWavePath}
            fill="none"
            stroke="var(--loading-wave-brown)"
            strokeWidth="2.1"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`${-GRID_WIDTH} 0`}
              dur={`${waveConfig.primaryDuration.toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </path>
          <path
            d={secondaryWavePath}
            fill="none"
            stroke="var(--loading-wave-brown)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.65"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`${-GRID_WIDTH} 0`}
              dur={`${waveConfig.secondaryDuration.toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </path>
        </g>
        <text x="16" y="24" fontSize="7" fill="var(--loading-wave-brown)">
          α
        </text>
        <text x="238" y="75" fontSize="7" fill="var(--loading-wave-brown)">
          t
        </text>
      </svg>
      <p className="text-base font-semibold tracking-[0.16em] text-[var(--foreground)]">
        LOADING
      </p>
      <p className="text-xs tracking-[0.08em] text-[var(--foreground)]/75">
        Wavefield Transition Detected
      </p>
    </div>
  );
};

export default LoadingIndicator;
