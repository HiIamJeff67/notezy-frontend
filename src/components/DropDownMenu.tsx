"use client";

import "@/global/styles/scrollbar.css";
import { DropdownOptionType } from "@/global/types/dropdownOptionType.type";
import { ElementSize } from "@/global/types/elementSize.type";
import { HTMLElementPosition } from "@/global/types/htmlElementPosition.type";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  changeablePosition: HTMLElementPosition;
  options: DropdownOptionType[];
  currentOption: DropdownOptionType;
  setCurrentOption: (option: DropdownOptionType) => void;
  menuSize?: ElementSize;
  buttonSize?: ElementSize;
  menuClassName?: string;
  optionClassName?: string;
  onCloseTimeout?: number;
}

type AnimationStage =
  | "idle"
  | "expanding-x"
  | "expanding-y"
  | "open"
  | "closing-y"
  | "closing-x"
  | "closed";

const DropdownMenu = ({
  isOpen,
  onClose,
  changeablePosition,
  options,
  currentOption,
  setCurrentOption,
  menuSize = { width: 200, height: 200 },
  buttonSize = { width: 40, height: 40 },
  menuClassName,
  optionClassName,
  onCloseTimeout,
}: DropdownMenuProps) => {
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
        onClose();
      }, 150);

      return () => clearTimeout(closeXTimer);
    }, 200);

    return () => clearTimeout(closeYTimer);
  };

  const handleSelectOption = (selectedOption: DropdownOptionType) => {
    setCurrentOption(selectedOption);

    // more delay so the user can see the option they chosen
    setTimeout(() => {
      handleClose();
    }, onCloseTimeout ?? 150);
  };

  // calculate the animation styles
  const getAnimatedStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      top: changeablePosition.top,
      right: changeablePosition.right,
      zIndex: 100,
      transformOrigin: "top right",
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
          width: `${menuSize.width}px`,
          height: `${buttonSize.height}px`,
          transition: "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "expandY 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      case "open":
        return {
          ...baseStyles,
          width: `${menuSize.width}px`,
          height: `${menuSize.height}px`,
        };

      case "closing-y":
        return {
          ...baseStyles,
          width: `${menuSize.width}px`,
          height: `${menuSize.height}px`,
          transition: "height 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "collapseY 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        };

      case "closing-x":
        return {
          ...baseStyles,
          width: `${menuSize.width}px`,
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

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`${menuClassName} p-0 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg overflow-hidden`}
      style={getAnimatedStyles()}
    >
      {/* only display the options while the menu is completely opened */}
      {(animationStage === "open" || animationStage === "closing-y") && (
        <div
          className={`
          p-2 transition-opacity duration-200 
          ${animationStage === "open" ? "opacity-100" : "opacity-0"}
          overflow-y-auto overflow-x-hidden
          hide-scrollbar
          flex flex-col items-center gap-2
        `}
          style={{
            maxHeight: `${menuSize.height - 16}px`,
          }}
        >
          {options.map((option, index) => (
            <Button
              key={option.key}
              variant="ghost"
              onClick={() => handleSelectOption(option)}
              className={`
                ${optionClassName}
                w-full px-4 py-3 text-left text-white hover:bg-white/20 flex items-center gap-3 rounded-md transition-all duration-200 cursor-pointer
                ${currentOption === option ? "bg-white/10" : ""}
              `}
              style={{
                // separate the animation
                transitionDelay: `${index * 30}ms`,
                transform:
                  animationStage === "open"
                    ? "translateY(0)"
                    : "translateY(-10px)",
                opacity: animationStage === "open" ? 1 : 0,
              }}
            >
              <span className="flex-1">{option.nativeName}</span>
              {currentOption === option && (
                <span className="text-blue-400 text-sm">✓</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
