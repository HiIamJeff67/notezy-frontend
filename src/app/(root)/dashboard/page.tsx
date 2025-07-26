"use client";

import HorizontalBar from "@/components/HorizontalBar";
import AvatarIcon from "@/components/icons/AvatarIcon";
import ColorPaletteIcon from "@/components/icons/ColorPaletteIcon";
import ScrollableDropDownMenu from "@/components/ScrollableDropDownMenu";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { useLoading, useTheme } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { HTMLElementPosition } from "@/shared/types/htmlElementPosition.type";
import { useEffect, useRef, useState } from "react";

const DashboardPage = () => {
  const [displayAvailableThemes, setDisplayAvailableThemes] =
    useState<boolean>(false);
  const [availableThemesButtonPosition, setAvailableThemesButtonPosition] =
    useState<HTMLElementPosition>({ top: 0, right: 0 });
  const [displayUserDetails, setDisplayUserDetails] = useState<boolean>(false);
  const [userDetailsButtonPosition, setUserDetailsButtonPosition] =
    useState<HTMLElementPosition>({ top: 0, right: 0 });
  const loadingManager = useLoading();
  const userDataManager = useUserData();
  const themeManager = useTheme();
  const availableThemesButtonRef = useRef<HTMLButtonElement>(null);
  const userDetailsButtonRef = useRef<HTMLButtonElement>(null);

  const updateAvailableThemesButtonPosition = function () {
    if (availableThemesButtonRef.current) {
      const rect = availableThemesButtonRef.current.getBoundingClientRect();
      setAvailableThemesButtonPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const updateUserDetailsButtonPosition = function () {
    if (userDetailsButtonRef.current) {
      const rect = userDetailsButtonRef.current.getBoundingClientRect();
      setUserDetailsButtonPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right,
      });
    }
  };

  useEffect(() => {
    loadingManager.setIsLoading(false);
    console.log(userDataManager.userData);
  }, []);

  return (
    <div>
      <SideBar />
      {displayAvailableThemes && (
        <ScrollableDropDownMenu
          size={{ width: 210, height: 230 }}
          className="bg-popover border-border border-1 rounded-sm shadow-lg p-2 m-1"
          containerClassName="flex flex-col items-center gap-2 pb-1"
          isOpen={displayAvailableThemes}
          setIsOpen={status => setDisplayAvailableThemes(status)}
          changeablePosition={availableThemesButtonPosition}
        >
          {themeManager.availableThemes.map((option, _) => (
            <Button
              key={option.id}
              variant="ghost"
              onClick={() => themeManager.switchCurrentTheme(option.id)}
              className={`
                w-full h-12 px-4 py-3 text-left
                bg-muted border-border border-1
                hover:bg-muted-foreground
                flex items-center gap-3 rounded-md transition-all duration-200 cursor-pointer
                ${themeManager.currentTheme === option ? "bg-muted" : ""}
              `}
            >
              <span className="flex-1 text-foreground">{option.name}</span>
              {themeManager.currentTheme === option && (
                <span className="text-secondary-400 text-sm">✓</span>
              )}
            </Button>
          ))}
        </ScrollableDropDownMenu>
      )}
      {displayUserDetails && (
        <ScrollableDropDownMenu
          size={{ width: 210, height: 230 }}
          className="bg-popover border-border border-1 rounded-sm p-2 m-1"
          containerClassName="flex flex-col items-center gap-2 pb-1"
          isOpen={displayUserDetails}
          setIsOpen={status => setDisplayUserDetails(status)}
          changeablePosition={userDetailsButtonPosition}
        >
          <></>
        </ScrollableDropDownMenu>
      )}
      <HorizontalBar
        width={180}
        height={40}
        className="fixed top-0 right-0 m-2 bg-secondary border-border border-1 shader-lg"
      >
        <Button
          ref={availableThemesButtonRef}
          variant="default"
          className="cursor-pointer font-bold z-20 right-0 top-0 rounded-full w-10 h-7 p-0"
          onClick={() => {
            updateAvailableThemesButtonPosition();
            setDisplayAvailableThemes(prev => !prev);
          }}
        >
          <ColorPaletteIcon />
        </Button>
        <Button
          ref={userDetailsButtonRef}
          variant="default"
          className="
          w-7 h-7 rounded-full p-0 m-0
          border-2 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out
          "
          onClick={() => {
            updateUserDetailsButtonPosition();
            setDisplayUserDetails(prev => !prev);
          }}
        >
          <AvatarIcon avatarURL="" size={28} />
        </Button>
      </HorizontalBar>
    </div>
  );
};

export default DashboardPage;
