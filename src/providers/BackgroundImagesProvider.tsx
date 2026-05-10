import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import {
  ImageContent,
  ImageInfo,
  ImageThumbnailInfo,
} from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { createContext, useCallback, useEffect, useState } from "react";

interface BackgroundImagesContextType {
  thumbnails: ImageThumbnailInfo | null;
  currentBackgroundImage: ImageContent | null;
  setCurrentBackgroundImageById: (id: UUID | null) => Promise<void>;
  setCurrentBackgroundImageByFile: (file: File | null) => Promise<void>;
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
  const [currentBackgroundImage, _setCurrentBackgroundImage] =
    useState<ImageContent | null>(null);

  useEffect(() => {
    const fetchCurrentItems = async () => {
      const [savedCurrentBackgroundImage, savedThumbnails] = await Promise.all([
        IndexedDBManipulator.getItemByKey(IndexedDBKey.currentBackgroundImage),
        IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImageThumbnails),
      ]);

      if (savedCurrentBackgroundImage) {
        _setCurrentBackgroundImage(savedCurrentBackgroundImage);
      }

      if (savedThumbnails !== null && savedThumbnails.contents.length !== 0) {
        setThumbnails(savedThumbnails);
      }
    };

    fetchCurrentItems();
  }, []);

  const setCurrentBackgroundImage = useCallback(
    async (newCurrentBackgroundImage: ImageContent | null) => {
      _setCurrentBackgroundImage(newCurrentBackgroundImage);
      await IndexedDBManipulator.setItem(
        IndexedDBKey.currentBackgroundImage,
        newCurrentBackgroundImage
      );
    },
    []
  );

  const setCurrentBackgroundImageById = useCallback(
    async (id: UUID | null) => {
      if (id === null) {
        await setCurrentBackgroundImage(null);
        return;
      }

      const imageInfo = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.backgroundImages
      );
      if (!imageInfo) throw new Error("No such image found in indexedDB");

      const targetImage = imageInfo.contents.find(img => img.id === id);
      if (!targetImage || !targetImage.file)
        throw new Error("No such image found in indexedDB");

      await setCurrentBackgroundImage(targetImage);
    },
    [setCurrentBackgroundImage]
  );

  const setCurrentBackgroundImageByFile = useCallback(
    async (file: File | null) => {
      if (file === null) {
        await setCurrentBackgroundImage(null);
        return;
      }

      await setCurrentBackgroundImage({
        id: generateUUID(),
        contentType: file.type || "image/png",
        file,
        timestamp: new Date(),
      });
    },
    [setCurrentBackgroundImage]
  );

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

  const upload = useCallback(
    async (files: File[]): Promise<UUID[]> => {
      if (files.length === 0) return [];

      const [imageInfo, thumbnailsInfo] = await Promise.all([
        IndexedDBManipulator.getItemByKey(IndexedDBKey.backgroundImages),
        IndexedDBManipulator.getItemByKey(
          IndexedDBKey.backgroundImageThumbnails
        ),
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
      let lastUploadedImage: ImageContent | null = null;

      for (const file of files) {
        const newId = generateUUID();
        const currentTimestamp = new Date();
        uploadedIds.push(newId);

        const imageContent: ImageContent = {
          id: newId,
          contentType: file.type,
          file: file,
          timestamp: currentTimestamp,
        };

        lastUploadedImage = imageContent;
        newImageInfo.header.totalSize += file.size;
        newImageInfo.contents.push(imageContent);

        const thumbnailStr = await generateThumbnailURL(file);
        const approximateStringSize = thumbnailStr.length;

        newThumbnailsInfo.header.totalSize += approximateStringSize;
        newThumbnailsInfo.contents.push({
          id: newId,
          contentType: file.type,
          thumbnailURL: thumbnailStr,
          timestamp: currentTimestamp,
        });
      }

      await Promise.all([
        IndexedDBManipulator.setItem(IndexedDBKey.backgroundImages, newImageInfo),
        IndexedDBManipulator.setItem(
          IndexedDBKey.backgroundImageThumbnails,
          newThumbnailsInfo
        ),
      ]);

      setThumbnails(newThumbnailsInfo);

      if (currentBackgroundImage === null && lastUploadedImage !== null) {
        await setCurrentBackgroundImage(lastUploadedImage);
      }

      return uploadedIds;
    },
    [currentBackgroundImage, setCurrentBackgroundImage]
  );

  const remove = useCallback(
    async (ids: UUID[]) => {
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

      await Promise.all([
        IndexedDBManipulator.setItem(IndexedDBKey.backgroundImages, newImageInfo),
        IndexedDBManipulator.setItem(
          IndexedDBKey.backgroundImageThumbnails,
          newThumbnailsInfo
        ),
      ]);

      setThumbnails(newThumbnailsInfo);

      if (currentBackgroundImage && ids.includes(currentBackgroundImage.id)) {
        await setCurrentBackgroundImage(
          newImageContents.length > 0 ? newImageContents[0] : null
        );
      }
    },
    [currentBackgroundImage, setCurrentBackgroundImage]
  );

  return (
    <BackgroundImagesContext.Provider
      value={{
        thumbnails: thumbnails,
        currentBackgroundImage: currentBackgroundImage,
        setCurrentBackgroundImageById: setCurrentBackgroundImageById,
        setCurrentBackgroundImageByFile: setCurrentBackgroundImageByFile,
        getFullImageURL: getFullImageURL,
        upload: upload,
        remove: remove,
      }}
    >
      {children}
    </BackgroundImagesContext.Provider>
  );
};
