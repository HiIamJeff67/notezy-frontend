"use client";

import DropdownMenu from "@/components/DropDownMenu";
import { DocumentIcon } from "@/components/icons/DocumentIcon";
import { LanguageIcon } from "@/components/icons/LanguageIcon";
import { NoteIcon } from "@/components/icons/NoteIcon";
import { Button } from "@/components/ui/button";
import "@/global/styles/animation.css";
import { HTMLElementPosition } from "@/global/types/htmlElementPosition.type";
import { Language } from "@/global/types/language.type";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

const HomPage = () => {
  const [displayTitle, setDisplayTitle] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const [displayLanguageMenu, setDisplayLanguageMenu] =
    useState<boolean>(false);
  const [languageButtonPosition, setLanguageButtonPosition] =
    useState<HTMLElementPosition>({ top: 0, right: 0 });
  const router = useAppRouter();
  const languageManager = useLanguage();
  const { setIsLoading } = useLoading();
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const updateLanguageButtonPosition = () => {
    if (languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      setLanguageButtonPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  }, []);

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

  const startCycle = useCallback(() => {
    clearAllTimers();

    // displaying the mainTitle
    setDisplayTitle(true);
    typeWriter(languageManager.t("homePage.mainTitle"), false);

    // erasing the mainTitle
    const erasingTopicTimer = setTimeout(() => {
      typeWriter(languageManager.t("homePage.mainTitle"), true);

      // displaying the secondaryTitle
      const displayingContentTimer = setTimeout(() => {
        setDisplayTitle(false);
        typeWriter(languageManager.t("homePage.secondaryTitle"), false);

        // erasing the secondaryTitle
        const erasingContentTimer = setTimeout(() => {
          typeWriter(languageManager.t("homePage.secondaryTitle"), true);

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
  }, []);

  useEffect(() => {
    setIsLoading(false);
    startCycle();
    return () => clearAllTimers();
  }, []);

  return (
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
      <div>
        <Button
          variant="secondary"
          className="cursor-pointer font-bold z-20 absolute right-0 top-0 mt-4 mr-4 rounded-full w-10 h-10 p-0"
          onClick={() => {
            updateLanguageButtonPosition();
            setDisplayLanguageMenu(prev => !prev);
          }}
        >
          <LanguageIcon size={28} />
        </Button>
        <DropdownMenu
          isOpen={displayLanguageMenu}
          onClose={() => {
            setDisplayLanguageMenu(false);
          }}
          changeablePosition={languageButtonPosition}
          options={languageManager.availableLanguages}
          currentOption={languageManager.language}
          setCurrentOption={option =>
            languageManager.setLanguage(option as Language)
          }
          menuSize={{ width: 210, height: 230 }}
          menuClassName="mt-4 mr-4"
          optionClassName="h-12"
        />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-white text-center select-none flex flex-col items-center justify-center gap-0">
          <div className="min-h-[160px] flex flex-col items-center justify-center">
            <div
              className={`
                  ${
                    displayTitle
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
              {languageManager.t("homePage.subtitle")}
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Button
              variant="secondary"
              className="cursor-pointer font-bold"
              onClick={() => router.push("documents")}
            >
              <DocumentIcon size={18} />
              {languageManager.t("homePage.viewDocs")}
            </Button>
            <Button
              variant="default"
              className="cursor-pointer font-bold"
              onClick={() => router.push("login")}
            >
              <NoteIcon size={18} />
              {languageManager.t("homePage.getStarted")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomPage;
