import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSettingsDisplay } from "@/hooks";
import AccountSettingsPage from "@/pages/root/setting/account/AccountSettingsPage";
import PreferencesPage from "@/pages/root/setting/preferences/PreferencesPage";

const SettingsSheet = () => {
  const { sheetPage, closeSheet } = useSettingsDisplay();

  return (
    <Sheet
      modal={false}
      open={sheetPage !== null}
      onOpenChange={open => {
        if (!open) closeSheet();
      }}
    >
      <SheetContent
        className="w-[min(94vw,38rem)] gap-0 overflow-hidden border-border p-0 sm:w-[min(88vw,38rem)] sm:max-w-[min(88vw,38rem)] lg:w-[min(52vw,38rem)] lg:max-w-[min(52vw,38rem)] [&_[data-slot=sheet-close]]:top-3 [&_[data-slot=sheet-close]]:right-3 [&_[data-slot=sheet-close]]:z-20 [&_[data-slot=sheet-close]]:flex [&_[data-slot=sheet-close]]:size-7 [&_[data-slot=sheet-close]]:items-center [&_[data-slot=sheet-close]]:justify-center [&_[data-slot=sheet-close]]:rounded-md [&_[data-slot=sheet-close]]:border-0 [&_[data-slot=sheet-close]]:bg-transparent [&_[data-slot=sheet-close]]:p-0 [&_[data-slot=sheet-close]]:text-foreground [&_[data-slot=sheet-close]]:opacity-100 [&_[data-slot=sheet-close]]:select-none [&_[data-slot=sheet-close]]:hover:bg-primary"
        overlayClassName="bg-overlay/35"
        onInteractOutside={event => event.preventDefault()}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {sheetPage === "account"
              ? "Account settings"
              : "Preference settings"}
          </SheetTitle>
          <SheetDescription>
            Manage Notezy settings without leaving the current workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          {sheetPage === "account" && (
            <AccountSettingsPage displayMode="sheet" />
          )}
          {sheetPage === "preferences" && (
            <PreferencesPage displayMode="sheet" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
