"use client";

import "@/global/styles/panel.css";
import { toCamelCase } from "@/lib/stringCaseConversions";
import { useState } from "react";

interface AuthPanelInput {
  title: string;
  placeholder: string;
  type?: "text" | "email" | "password" | "number";
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface AuthSwitchButton {
  description: string;
  title: string;
  onClick: () => void;
}

interface AuthPanelProps {
  title: string;
  subtitle?: string;
  inputs: AuthPanelInput[];
  submitButtonText: string;
  onSubmit: () => Promise<void>;
  switchButtons?: AuthSwitchButton[];
  statusDetail?: string;
  isLoading?: boolean;
}

const AuthPanel = ({
  title,
  subtitle,
  inputs,
  submitButtonText,
  onSubmit,
  switchButtons,
  statusDetail,
  isLoading = false,
}: AuthPanelProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <div
        className={`
          relative w-[450px] px-10 py-12 rounded-lg overflow-hidden
          panel-gradient panel-texture panel-shine
          shadow-[0_25px_50px_rgba(0,0,0,0.8),0_10px_25px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)]
          transform transition-all duration-300 ease-out
          ${
            isHovered
              ? "shadow-[0_30px_60px_rgba(0,0,0,0.9),0_15px_35px_rgba(0,0,0,0.7),inset_0_1px_3px_rgba(255,255,255,0.15),inset_0_-1px_3px_rgba(0,0,0,0.6)] translate-y-[-4px]"
              : ""
          }
          perspective-1000 rotate-x-[5deg] translate-z-0
          ${isLoading ? "pointer-events-none opacity-75" : ""}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered
            ? "perspective(1000px) rotateX(2deg) translateZ(10px) translateY(-4px)"
            : "perspective(1000px) rotateX(5deg) translateZ(0)",
        }}
      >
        {/* Corner Screws */}
        {[
          { position: "top-4 left-4" },
          { position: "top-4 right-4" },
          { position: "bottom-4 left-4" },
          { position: "bottom-4 right-4" },
        ].map((screw, index) => (
          <div
            key={index}
            className={`absolute ${screw.position} w-3.5 h-3.5 rounded-full screw-gradient shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.1)] z-10`}
          >
            <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_#333]"></div>
            <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_#333]"></div>
          </div>
        ))}

        {/* Panel Content */}
        <div className="relative z-5">
          <h2
            className="font-mono text-2xl font-bold text-green-400 text-center mb-2 tracking-[2px]"
            style={{ textShadow: "0 0 10px rgba(0, 255, 136, 0.3)" }}
          >
            {title}
          </h2>

          <div className="font-mono text-xs text-gray-500 text-center mb-8 tracking-wider">
            {subtitle ?? `Authentication panel for ${toCamelCase(title)}`}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {inputs.map((input, index) => (
              <div key={index} className="flex flex-col gap-2">
                <label
                  htmlFor={`input-${index}`}
                  className="font-mono text-base text-green-400 tracking-wider font-bold"
                >
                  {input.title}
                </label>
                <input
                  type={input.type || "text"}
                  id={`input-${index}`}
                  value={input.value}
                  onChange={e => input.onChange(e.target.value)}
                  required={input.required !== false}
                  disabled={isLoading}
                  className="
                    input-gradient border border-gray-700 rounded px-4 py-3 text-white 
                    font-mono text-sm transition-all duration-300
                    shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.3)]
                    focus:outline-none focus:border-green-400 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_10px_rgba(0,255,136,0.2)]
                    placeholder:text-gray-600 placeholder:italic
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  placeholder={input.placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="
                relative button-gradient border border-green-400 rounded-md px-8 py-4 
                text-green-400 font-mono text-base font-bold tracking-wider cursor-pointer 
                transition-all duration-300 mt-4 overflow-hidden
                hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              "
            >
              <span className="relative z-2">
                {isLoading ? "PROCESSING..." : submitButtonText}
              </span>
              {!isLoading && (
                <div
                  className="
                  absolute top-0 left-[-100%] w-full h-full 
                  bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.2)] to-transparent
                  button-glow
                "
                ></div>
              )}
            </button>
          </form>

          {switchButtons && (
            <div className="mt-4 pt-2 border-t border-gray-700/50">
              {switchButtons.map((switchButton, index) => (
                <div
                  key={index}
                  className="mt-2 mb-2 text-center font-mono text-xs text-gray-500 tracking-wider"
                >
                  <span className="mr-2 select-none">
                    {switchButton.description}
                  </span>
                  <button
                    type="button"
                    onClick={switchButton.onClick}
                    className="relative inline-block px-3 py-1 ml-1
                    font-mono text-xs font-bold tracking-wider uppercase
                    text-green-400 cursor-pointer
                    border border-green-400/30 rounded
                    bg-gradient-to-r from-gray-900/50 to-gray-800/50
                    transition-all duration-300 ease-out
                    hover:border-green-400/60 hover:text-green-300
                    hover:shadow-[0_0_10px_rgba(0,255,136,0.2)]
                    hover:bg-gradient-to-r hover:from-green-900/20 hover:to-green-800/20
                    focus:outline-none focus:ring-1 focus:ring-green-400/50
                    active:scale-95
                    before:absolute before:inset-0 
                    before:bg-gradient-to-r before:from-transparent before:via-green-400/5 before:to-transparent
                    before:opacity-0 before:transition-opacity before:duration-300
                    hover:before:opacity-100"
                    style={{
                      textShadow: "0 0 5px rgba(0, 255, 136, 0.2)",
                    }}
                  >
                    <span className="relative z-10">{switchButton.title}</span>

                    {/* Subtle glow effect */}
                    <div
                      className="absolute inset-0 rounded
                      bg-gradient-to-r from-transparent via-green-400/10 to-transparent
                      opacity-0 transition-opacity duration-300
                      group-hover:opacity-100"
                    />

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute top-0 right-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-green-400/30 rounded-full"></div>
                  </button>
                </div>
              ))}

              {/* Add a subtle separator line with tech pattern */}
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                  <div className="w-2 h-0.5 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"></div>
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                  <div className="w-2 h-0.5 bg-gradient-to-r from-transparent via-green-400/20 to-transparent"></div>
                  <div className="w-1 h-1 bg-green-400/30 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {statusDetail && statusDetail !== "" && (
            <div className="flex items-center justify-center gap-2 mt-8 font-mono text-xs text-gray-500">
              <div
                className={`
              w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]
              ${
                isLoading
                  ? "bg-yellow-400 shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                  : "bg-green-400 status-indicator"
              }
            `}
              ></div>
              <span>{statusDetail}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
