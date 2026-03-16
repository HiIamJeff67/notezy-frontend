import { useEffect, useState } from "react";

export interface ClockWidgetProps {}

const ClockWidget = ({}: ClockWidgetProps) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center justify-center 
                    text-[1em] font-mono"
    >
      {time.toLocaleTimeString()}
    </div>
  );
};

export default ClockWidget;
