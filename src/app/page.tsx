"use client";

import GridBlackBackground from "@/components/GridBackground/GridBackground";
import CheckIcon from "@/components/icons/CheckIcon";
import ColorPaletteIcon from "@/components/icons/ColorPaletteIcon";
import DocumentIcon from "@/components/icons/DocumentIcon";
import LanguageIcon from "@/components/icons/LanguageIcon";
import NoteIcon from "@/components/icons/NoteIcon";
import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useAppRouter, useLanguage, useTheme } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

const DisplayTitle = {
  mainTitle: "Notezy",
  secondaryTitle: "A More Humanized AI-Driven Note-Taking Application",
};

const HomePage = () => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const themeManager = useTheme();

  const [displayTitle, setDisplayTitle] = useState<boolean>(true);
  const [currentText, setCurrentText] = useState("");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

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
          }, 3500);

          timersRef.current.push(restartTimer);
        }, 3500);

        timersRef.current.push(erasingContentTimer);
      }, 1000);

      timersRef.current.push(displayingContentTimer);
    }, 4000);

    timersRef.current.push(erasingTopicTimer);
  }, []);

  useEffect(() => {
    startCycle();
    return () => clearAllTimers();
  }, []);

  return (
    <GridBlackBackground>
      <Suspense fallback={<StrictLoadingOutlay />}>
        <div className="fixed top-2 right-2 z-50">
          <Menubar className="bg-secondary border-border border shadow-lg">
            <MenubarMenu>
              <MenubarTrigger className="px-3 py-2 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
                <LanguageIcon size={16} className="mr-2" />
                <span className="text-sm font-medium">
                  {languageManager.t(tKey.languages.language)}
                </span>
              </MenubarTrigger>
              <MenubarContent className="w-56 bg-popover border-border">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {`${languageManager.t(tKey.common.choose)}${languageManager.t(
                    tKey.syntax.separator
                  )}${languageManager.t(tKey.languages.language)}`}
                </div>
                <MenubarSeparator />
                {languageManager.availableLanguages.map(language => (
                  <MenubarItem
                    key={language.key}
                    onClick={() => languageManager.setCurrentLanguage(language)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{languageManager.t(language.translationKey)}</span>
                    {languageManager.currentLanguage === language && (
                      <span className="text-accent text-sm">✓</span>
                    )}
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="px-3 py-2 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent active:text-accent-foreground">
                <ColorPaletteIcon size={16} className="mr-2" />
                <span className="text-sm font-medium">
                  {languageManager.t(tKey.themes.theme)}
                </span>
              </MenubarTrigger>
              <MenubarContent className="w-56 bg-popover border-border">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {`${languageManager.t(tKey.common.choose)}${languageManager.t(
                    tKey.syntax.separator
                  )}${languageManager.t(tKey.themes.theme)}`}
                </div>
                <MenubarSeparator />
                {themeManager.availableThemes.map(theme => (
                  <MenubarItem
                    key={theme.id}
                    onClick={() => themeManager.switchCurrentTheme(theme.id)}
                    className="flex items-center justify-between cursor-pointer"
                    defaultChecked={themeManager.currentTheme.id === theme.id}
                  >
                    <span>{languageManager.t(theme.translationKey)}</span>
                    {themeManager.currentTheme.id === theme.id && <CheckIcon />}
                  </MenubarItem>
                ))}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-foreground text-center select-none flex flex-col items-center justify-center gap-0">
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
                className="cursor-pointer font-bold hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent active:text-accent-foreground"
                onClick={() => {
                  router.push(WebURLPathDictionary.root.documents);
                }}
              >
                <DocumentIcon size={18} />
                {languageManager.t(tKey.homePage.viewDocs)}
              </Button>
              <Button
                variant="default"
                className="cursor-pointer font-bold hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/90"
                onClick={() => {
                  router.push(WebURLPathDictionary.auth.login);
                }}
              >
                <NoteIcon size={18} />
                {languageManager.t(tKey.homePage.getStarted)}
              </Button>
            </div>
          </div>
        </div>
      </Suspense>
    </GridBlackBackground>
  );
};

export default HomePage;
