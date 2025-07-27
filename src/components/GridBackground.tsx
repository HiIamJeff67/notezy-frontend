import React from "react";

const GridBlackBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-full w-full bg-black relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 70%, black 100%)`,
        }}
      />
      {children}
    </div>
  );
};

export default GridBlackBackground;
