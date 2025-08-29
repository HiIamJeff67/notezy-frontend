import { useLoading, useShelf } from "@/hooks";
import { useEffect } from "react";

const ShelfMenu = () => {
  const loadingManager = useLoading();
  const shelfManager = useShelf();

  useEffect(() => {
    const initSearchCompressedShelves = async () => {
      await shelfManager.searchCompressedShelves();
    };
    initSearchCompressedShelves();

    loadingManager.setIsLoading(false);
  }, []);

  return (
    <div>
      {shelfManager.compressedShelves.map((val, index) => (
        <div key={index}>{val.node.name}</div>
      ))}
    </div>
  );
};

export default ShelfMenu;
