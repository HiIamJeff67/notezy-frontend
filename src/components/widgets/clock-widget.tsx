import { useEffect, useState } from "react";

export interface ClockWidgetProps {
  width: number;
  height: number;
}

const ClockWidget = ({ width, height }: ClockWidgetProps) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="w-full h-full flex items-center justify-center 
                    text-[1em] font-mono"
    >
      {time.toLocaleTimeString()}
    </div>
  );
};

export default ClockWidget;
