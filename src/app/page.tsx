"use client";

import { Button } from "@/components/ui/button";
import "@/global/styles/animation.css";
import { useEffect, useRef, useState } from "react";

const DisplayText = {
  topic: "Notezy",
  content: "A More Humanized AI-Driven Note-Taking Application",
};

const Introduction = () => {
  const [displayTopic, setDisplayTopic] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = function () {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const typeWriter = (text: string, isErasing: boolean) => {
    const chars = text.split("");
    let currentIndex = isErasing ? chars.length : 0;

    const timer = setInterval(() => {
      if (isErasing) {
        currentIndex--;
        setCurrentText(chars.slice(0, currentIndex).join(""));
        if (currentIndex <= 0) {
          clearInterval(timer);
        }
      } else {
        currentIndex++;
        setCurrentText(chars.slice(0, currentIndex).join(""));
        if (currentIndex >= chars.length) {
          clearInterval(timer);
        }
      }
    }, 50);

    timersRef.current.push(timer);
  };

  const startCycle = () => {
    clearAllTimers();

    // displaying the topic
    setDisplayTopic(true);
    typeWriter(DisplayText.topic, false);

    // erasing the topic
    const erasingTopicTimer = setTimeout(() => {
      typeWriter(DisplayText.topic, true);

      // displaying the content
      const displayingContentTimer = setTimeout(() => {
        setDisplayTopic(false);
        typeWriter(DisplayText.content, false);

        // erasing the content
        const erasingContentTimer = setTimeout(() => {
          typeWriter(DisplayText.content, true);

          // restart the entire loop
          const restartTimer = setTimeout(() => {
            startCycle();
          }, 3500); // time during the process of erasing the content

          timersRef.current.push(restartTimer);
        }, 3500); // time during the process of displaying the content

        timersRef.current.push(erasingContentTimer);
      }, 1000); // time during the process of erasing the topic

      timersRef.current.push(displayingContentTimer);
    }, 4000); // time during the process of displaying the topic

    timersRef.current.push(erasingTopicTimer);
  };

  useEffect(() => {
    startCycle();
    return () => clearAllTimers();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-black relative overflow-hidden">
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
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-white text-center select-none flex flex-col items-center justify-center gap-0">
            <div className="min-h-[160px] flex flex-col items-center justify-center">
              <div
                className={`
                  ${
                    displayTopic
                      ? "max-w-[400px] text-6xl"
                      : "max-w-[600px] text-4xl"
                  } 
                   font-bold pb-2 leading-tight text-center
                `}
              >
                {currentText}
                <span className="animate-pulse text-white">|</span>
              </div>
              <p className="text-lg opacity-80">
                Your digital note-taking companion
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Button variant="secondary" className="cursor-pointer font-bold">
                View Docs
              </Button>
              <Button variant="default" className="cursor-pointer font-bold">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
