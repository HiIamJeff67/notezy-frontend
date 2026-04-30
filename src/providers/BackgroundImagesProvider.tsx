import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { ImageInfo, ImageThumbnailInfo } from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { createContext, useCallback, useEffect, useState } from "react";

interface BackgroundImagesContextType {
  thumbnails: ImageThumbnailInfo | null;
  currentBackgroundImageId: UUID | null;
  setCurrentBackgroundImageId: (
    newCurrentBackgroundImageId: UUID | null
  ) => void;
  getFullImageURL: (id: UUID) => Promise<{ url: string; revoke: () => void }>;
  upload: (files: File[]) => Promise<UUID[]>;
  remove: (ids: UUID[]) => Promise<void>;
}

export const BackgroundImagesContext = createContext<
  BackgroundImagesContextType | undefined
>(undefined);

interface BackgroundImagesProviderProps {
  children: React.ReactNode;
}

export const BackgroundImagesProvider = ({
  children,
}: BackgroundImagesProviderProps) => {
  const [thumbnails, setThumbnails] = useState<ImageThumbnailInfo | null>(null);
  const [currentBackgroundImageId, _setCurrentBackgroundImageId] =
    useState<UUID | null>(null);

  useEffect(() => {
    const fetchCurrentIds = async () => {
      const currentBackgroundImageId = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.currentBackgroundImageId
      );
      if (currentBackgroundImageId) {
        _setCurrentBackgroundImageId(currentBackgroundImageId as UUID);
      }
      // extend more other current background image id here...
    };

    const initializeImageThumbnails = async () => {
      const savedThumbnails = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.backgroundImageThumbnails
      );
      if (savedThumbnails !== null && savedThumbnails.contents.length !== 0) {
        setThumbnails(savedThumbnails);
      }
    };

    fetchCurrentIds();
    initializeImageThumbnails();
  }, []);

  const generateThumbnailURL = (
    file: File,
    maxWidth = 300
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to get 2D context"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.7);

        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for thumbnail"));
      };
    });
  };

  const setCurrentBackgroundImageId = useCallback(
    async (newCurrentBackgroundImageId: UUID | null) => {
      _setCurrentBackgroundImageId(newCurrentBackgroundImageId);
      await IndexedDBManipulator.setItem(
        IndexedDBKey.currentBackgroundImageId,
        newCurrentBackgroundImageId
      );
    },
    []
  );

  const getFullImageURL = useCallback(
    async (id: UUID): Promise<{ url: string; revoke: () => void }> => {
      const imageInfo = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.backgroundImages
      );
      if (!imageInfo) throw new Error("No such image found in indexedDB");

      const targetImage = imageInfo.contents.find(img => img.id === id);
      if (!targetImage || !targetImage.file)
        throw new Error("No such image found in indexedDB");

      const url = URL.createObjectURL(targetImage.file);
      return {
        url: url,
        revoke: () => URL.revokeObjectURL(url),
      };
    },
    []
  );

  const upload = useCallback(async (files: File[]): Promise<UUID[]> => {
    if (files.length === 0) return [];

    const [imageInfo, thumbnailsInfo] = await Promise.all([
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImages),
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImageThumbnails),
    ]);

    const newImageInfo: ImageInfo = imageInfo ?? {
      header: { totalSize: 0 },
      contents: [],
    };

    const newThumbnailsInfo: ImageThumbnailInfo = thumbnailsInfo ?? {
      header: { totalSize: 0 },
      contents: [],
    };

    const uploadedIds: UUID[] = [];

    for (const file of files) {
      const newId = generateUUID();
      const currentTimestamp = new Date();
      uploadedIds.push(newId);

      newImageInfo.header.totalSize += file.size;
      newImageInfo.contents.push({
        id: newId, // use the same id as the thumbnail image
        contentType: file.type,
        file: file,
        timestamp: currentTimestamp,
      });

      const thumbnailStr = await generateThumbnailURL(file);
      const approximateStringSize = thumbnailStr.length;

      newThumbnailsInfo.header.totalSize += approximateStringSize;
      newThumbnailsInfo.contents.push({
        id: newId, // use the same id as the original image
        contentType: file.type,
        thumbnailURL: thumbnailStr,
        timestamp: currentTimestamp,
      });
    }

    if (currentBackgroundImageId === null) {
      setCurrentBackgroundImageId(
        newImageInfo.contents[newImageInfo.contents.length - 1].id
      );
    }

    await Promise.all([
      IndexedDBManipulator.setItem(IndexedDBKey.backgroundImages, newImageInfo),
      IndexedDBManipulator.setItem(
        IndexedDBKey.backgroundImageThumbnails,
        newThumbnailsInfo
      ),
    ]);

    setThumbnails(newThumbnailsInfo);

    return uploadedIds;
  }, []);

  const remove = useCallback(async (ids: UUID[]) => {
    if (ids.length === 0) return;

    const [imageInfo, thumbnailsInfo] = await Promise.all([
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImages),
      IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImageThumbnails),
    ]);

    if (!imageInfo || !thumbnailsInfo) return;

    const newImageContents = imageInfo.contents.filter(
      img => !ids.includes(img.id)
    );
    const newImageTotalSize = newImageContents.reduce(
      (sum, img) => sum + (img.file?.size || 0),
      0
    );
    const newImageInfo: ImageInfo = {
      header: { totalSize: newImageTotalSize },
      contents: newImageContents,
    };

    const newThumbnailsContents = thumbnailsInfo.contents.filter(
      thumb => !ids.includes(thumb.id)
    );
    const newThumbnailsTotalSize = newThumbnailsContents.reduce(
      (sum, thumb) => sum + (thumb.thumbnailURL?.length || 0),
      0
    );
    const newThumbnailsInfo: ImageThumbnailInfo = {
      header: { totalSize: newThumbnailsTotalSize },
      contents: newThumbnailsContents,
    };

    for (const id of ids) {
      if (currentBackgroundImageId === id) {
        setCurrentBackgroundImageId(
          newImageContents.length > 0 ? newImageContents[0].id : null
        );
        break;
      }
    }

    await Promise.all([
      IndexedDBManipulator.setItem(IndexedDBKey.backgroundImages, newImageInfo),
      IndexedDBManipulator.setItem(
        IndexedDBKey.backgroundImageThumbnails,
        newThumbnailsInfo
      ),
    ]);

    setThumbnails(newThumbnailsInfo);
  }, []);

  return (
    <BackgroundImagesContext.Provider
      value={{
        thumbnails: thumbnails,
        currentBackgroundImageId: currentBackgroundImageId,
        setCurrentBackgroundImageId: setCurrentBackgroundImageId,
        getFullImageURL: getFullImageURL,
        upload: upload,
        remove: remove,
      }}
    >
      {children}
    </BackgroundImagesContext.Provider>
  );
};
