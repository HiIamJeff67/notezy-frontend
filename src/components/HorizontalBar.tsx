"use client";

import React from "react";

interface HorizontalBarProps {
  width?: number;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

const HorizontalBar = ({
  width = 200,
  height = 100,
  className = "",
  children,
}: HorizontalBarProps) => {
  return (
    <div
      className={`
        border-2 border-border rounded-sm
        flex items-center justify-end gap-2 px-1 py-2 z-30
        ${className}`}
      style={{
        width: width,
        height: height,
      }}
    >
      {children}
    </div>
  );
};

export default HorizontalBar;
