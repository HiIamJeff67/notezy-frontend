"use client";

import { ComponentProps } from "@/shared/types/component.type";
import { ElementSize } from "@/shared/types/elementSize.type";
import { HTMLElementPosition } from "@/shared/types/htmlElementPosition.type";
import { useEffect, useRef, useState } from "react";

import "@/global/styles/animation.css";

interface NonScrollableDropDownMenuProps extends ComponentProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (status: boolean) => void;
  changeablePosition: HTMLElementPosition;
  buttonSize?: ElementSize;
  onCloseTimeout?: number;
  maxItems?: number;
}

type AnimationStage =
  | "idle"
  | "expanding-x"
  | "expanding-y"
  | "open"
  | "closing-y"
  | "closing-x"
  | "closed";

const NonScrollableDropDownMenu = ({
  size,
  className = "",
  children,
  isOpen,
  setIsOpen,
  changeablePosition,
  buttonSize = { width: 40, height: 40 },
  onCloseTimeout = 0,
  maxItems = 5,
}: NonScrollableDropDownMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [animationStage, setAnimationStage] = useState<AnimationStage>("idle");
  const [isClosing, setIsClosing] = useState(false);

  // handling the open animation
  useEffect(() => {
    if (isOpen && !isClosing) {
      setAnimationStage("expanding-x");

      // expand x-axis (150ms)
      const expandXTimer = setTimeout(() => {
        setAnimationStage("expanding-y");

        // expand y-axis (200ms)
        const expandYTimer = setTimeout(() => {
          setAnimationStage("open");
        }, 200);

        return () => clearTimeout(expandYTimer);
      }, 150);

      return () => clearTimeout(expandXTimer);
    }
  }, [isOpen, isClosing]);

  // handling closing menu if clicking the outside area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen && animationStage === "open") {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, animationStage]);

  // handling the closing animation
  const handleClose = () => {
    if (isClosing) return;

    setIsClosing(true);
    setAnimationStage("closing-y");

    // shrink in y-axis (200ms)
    const closeYTimer = setTimeout(() => {
      setAnimationStage("closing-x");

      // shrink in x-axis (150ms)
      const closeXTimer = setTimeout(() => {
        setAnimationStage("closed");
        setIsClosing(false);
        setIsOpen(false);
      }, 150);

      return () => clearTimeout(closeXTimer);
    }, 200);

    return () => clearTimeout(closeYTimer);
  };

  // calculate the animation styles
  const getAnimatedStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      top: changeablePosition.top,
      right: changeablePosition.right,
      zIndex: 100,
      transformOrigin: "top right",
      transform: "translateZ(0)",
      backfaceVisibility: "hidden" as const,
      willChange: "width, height",
    };

    switch (animationStage) {
      case "expanding-x":
        return {
          ...baseStyles,
          width: `${buttonSize.width}px`,
          height: `${buttonSize.height}px`,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "expandX 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      case "expanding-y":
        return {
          ...baseStyles,
          width: `${size.width}px`,
          height: `${buttonSize.height}px`,
          transition: "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "expandY 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      case "open":
        return {
          ...baseStyles,
          width: `${size.width}px`,
          height: `${size.height}px`,
        };

      case "closing-y":
        return {
          ...baseStyles,
          width: `${size.width}px`,
          height: `${size.height}px`,
          transition: "height 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "collapseY 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      case "closing-x":
        return {
          ...baseStyles,
          width: `${size.width}px`,
          height: `${buttonSize.height}px`,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "collapseX 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      default:
        return {
          ...baseStyles,
          width: `${buttonSize.width}px`,
          height: `${buttonSize.height}px`,
        };
    }
  };

  const childrenProps = {
    animationStage,
    isAnimating: animationStage !== "open" && animationStage !== "idle",
    handleClose: () => {
      if (onCloseTimeout > 0) {
        setTimeout(() => {
          handleClose();
        }, onCloseTimeout);
      } else {
        handleClose();
      }
    },
    menuSize: size,
    maxItems,
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`
        ${className}
        overflow-hidden
      `}
      style={getAnimatedStyles()}
    >
      {(animationStage === "open" || animationStage === "closing-y") && (
        <div
          className={`
            w-full h-full
            flex flex-col
            transition-opacity duration-200 
            ${animationStage === "open" ? "opacity-100" : "opacity-0"}
          `}
          style={{
            // use overflow hidden instead of scrollable drop down menu
            maxHeight: `${size.height}px`,
            overflow: "hidden",
          }}
        >
          {/* if children is a function, passing the animation, else render directly */}
          {typeof children === "function"
            ? (children as any)(childrenProps)
            : children}
        </div>
      )}
    </div>
  );
};

export default NonScrollableDropDownMenu;
