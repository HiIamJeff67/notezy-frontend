"use client";

import DropdownTextMenu from "@/components/DropDownTextMenu";
import GridBlackBackground from "@/components/GridBackground";
import DocumentIcon from "@/components/icons/DocumentIcon";
import LanguageIcon from "@/components/icons/LanguageIcon";
import MoonIcon from "@/components/icons/MoonIcon";
import NoteIcon from "@/components/icons/NoteIcon";
import SunIcon from "@/components/icons/SunIcon";
import { Button } from "@/components/ui/button";
import { useAppRouter, useLanguage, useLoading, useTheme } from "@/hooks";
import {
  DefaultDarkTheme,
  DefaultLightTheme,
  DefaultStandardTheme,
} from "@/shared/constants/defaultThemes.constant";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { HTMLElementPosition } from "@/shared/types/htmlElementPosition.type";
import { Language } from "@/shared/types/language.type";
import { useCallback, useEffect, useRef, useState } from "react";

const DisplayTitle = {
  mainTitle: "Notezy",
  secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
};

const HomPage = () => {
  const [displayTitle, setDisplayTitle] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const [displayLanguageMenu, setDisplayLanguageMenu] =
    useState<boolean>(false);
  const [languageButtonPosition, setLanguageButtonPosition] =
    useState<HTMLElementPosition>({ top: 0, right: 0 });
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const themeManager = useTheme();
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const updateLanguageButtonPosition = function () {
    if (languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      setLanguageButtonPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const renderThemeButton = () => {
    const currentThemeId = themeManager.currentTheme?.id;
    const buttonClassName =
      "cursor-pointer font-bold z-20 absolute right-12 top-0 mt-4 mr-4 rounded-full w-8 h-8 p-0 flex items-center justify-center";

    switch (currentThemeId) {
      case DefaultStandardTheme.id:
        return (
          <Button
            variant="default"
            className={buttonClassName}
            onClick={() => {
              themeManager.switchCurrentTheme(DefaultDarkTheme.id);
            }}
          >
            <span>N</span>
          </Button>
        );
      case DefaultDarkTheme.id:
        return (
          <Button
            variant="default"
            className={buttonClassName}
            onClick={() => {
              themeManager.switchCurrentTheme(DefaultLightTheme.id);
            }}
          >
            <MoonIcon size={28} />
          </Button>
        );
      case DefaultLightTheme.id:
        return (
          <Button
            variant="default"
            className={buttonClassName}
            onClick={() => {
              themeManager.switchCurrentTheme(DefaultStandardTheme.id);
            }}
          >
            <SunIcon size={28} />
          </Button>
        );
    }
  };

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const typeWriter = function (text: string, isErasing: boolean) {
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
    typeWriter(DisplayTitle.mainTitle, false);

    // erasing the mainTitle
    const erasingTopicTimer = setTimeout(() => {
      typeWriter(DisplayTitle.mainTitle, true);

      // displaying the secondaryTitle
      const displayingContentTimer = setTimeout(() => {
        setDisplayTitle(false);
        typeWriter(DisplayTitle.secondaryTitle, false);

        // erasing the secondaryTitle
        const erasingContentTimer = setTimeout(() => {
          typeWriter(DisplayTitle.secondaryTitle, true);

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
    loadingManager.setIsLoading(false);
    startCycle();
    return () => clearAllTimers();
  }, []);

  return (
    <GridBlackBackground>
      <div>
        {displayLanguageMenu ? (
          <DropdownTextMenu
            isOpen={displayLanguageMenu}
            onClose={() => {
              setDisplayLanguageMenu(false);
            }}
            changeablePosition={languageButtonPosition}
            options={languageManager.availableLanguages}
            currentOption={languageManager.currentLanguage}
            setCurrentOption={option =>
              languageManager.setCurrentLanguage(option as Language)
            }
            menuSize={{ width: 210, height: 230 }}
            menuClassName="m-2"
            optionClassName="h-12"
          />
        ) : (
          <Button
            ref={languageButtonRef}
            variant="default"
            className="cursor-pointer font-bold z-20 absolute right-0 top-0 mt-4 mr-4 rounded-full w-8 h-8 p-0"
            onClick={() => {
              updateLanguageButtonPosition();
              setDisplayLanguageMenu(prev => !prev);
            }}
          >
            <LanguageIcon size={28} />
          </Button>
        )}
        {renderThemeButton()}
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
              {languageManager.t(tKey.homePage.subtitle)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Button
              variant="secondary"
              className="cursor-pointer font-bold"
              onClick={() => {
                loadingManager.setIsLoading(true);
                router.push(WebURLPathDictionary.documents);
              }}
            >
              <DocumentIcon size={18} />
              {languageManager.t(tKey.homePage.viewDocs)}
            </Button>
            <Button
              variant="default"
              className="cursor-pointer font-bold"
              onClick={() => {
                loadingManager.setIsLoading(true);
                router.push(WebURLPathDictionary.login);
              }}
            >
              <NoteIcon size={18} />
              {languageManager.t(tKey.homePage.getStarted)}
            </Button>
          </div>
        </div>
      </div>
    </GridBlackBackground>
  );
};

export default HomPage;
