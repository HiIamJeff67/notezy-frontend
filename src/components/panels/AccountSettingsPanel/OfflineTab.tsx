import { WifiOffIcon } from "lucide-react";

const OfflineTab = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-8 bg-card">
      <WifiOffIcon size={64} />
      <p className="flex-warp">
        Please connect to wifi before editing account settings
      </p>
    </div>
  );
};

export default OfflineTab;
