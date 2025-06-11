"use client";

import { LocalStoragePrefix } from "@/global/constants/defaultLocalStorage.constant";
import { StorageItem } from "@/global/types/localStorage.type";

export const useLocalStorage = () => {
  // check if the local storage is available or not,
  // since the user may using incognito mode or their memory is use up
  const isLocalStorageAvailable = (): boolean => {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      console.log(`The localStorage is not available`);
      return false;
    }
  };

  // get an item from local storage by providing a key
  const getItemByKey = function <K extends keyof StorageItem>(
    key: K
  ): StorageItem[K] | null {
    try {
      if (!isLocalStorageAvailable) return null;

      const storageKey = LocalStoragePrefix + key;
      const item = localStorage.getItem(storageKey);

      return item === null ? null : JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  };

  // get items from local storage by providing the keys of them
  const getItemsByKeys = function <K extends keyof StorageItem>(
    keys: K[]
  ): Pick<StorageItem, K> {
    if (!isLocalStorageAvailable) return {} as Pick<StorageItem, K>;

    const result = {} as Pick<StorageItem, K>;

    keys.forEach(key => {
      result[key] = getItemByKey(key);
    });

    return result;
  };

  // get all items from local storage
  const getAllItems = function <
    K extends keyof StorageItem
  >(): Partial<StorageItem> {
    if (!isLocalStorageAvailable) return {} as Partial<StorageItem>;

    const result = {} as Partial<StorageItem>;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const keyString = localStorage.key(i);
        if (keyString && keyString.startsWith(LocalStoragePrefix)) {
          const cleanKey = keyString.replace(LocalStoragePrefix, "") as K;
          result[cleanKey] = localStorage.getItem(keyString) as StorageItem[K];
        }
      }
    } catch (error) {
      console.error("Failed to get all localStorage items:", error);
    }

    return result;
  };

  // set an item to local storage by providing a key-value pair
  const setItem = function <K extends keyof StorageItem>(
    key: K,
    value: StorageItem[K] // use the key of the Storage
  ): boolean {
    if (!isLocalStorageAvailable) return false;

    try {
      const storageKey = LocalStoragePrefix + key;
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage item "${key}":`, error);
      return false;
    }
  };

  // set items to local storage by providing key-value pairs
  const setItems = function (items: Partial<StorageItem>): boolean {
    if (!isLocalStorageAvailable) return false;

    let success = true;
    Object.entries(items).forEach(([key, value]) => {
      if (value !== undefined) {
        success = success && setItem(key as keyof StorageItem, value);
      }
    });
    return success;
  };

  const hasItem = function <K extends keyof StorageItem>(key: K): boolean {
    if (!isLocalStorageAvailable) return false;

    return getItemByKey(key) !== null;
  };

  const removeItem = function <K extends keyof StorageItem>(key: K): boolean {
    if (!isLocalStorageAvailable) return false;

    try {
      const storageKey = LocalStoragePrefix + key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeItems = function <K extends keyof StorageItem>(
    keys: K[]
  ): boolean {
    if (!isLocalStorageAvailable) return false;

    let success = true;
    keys.forEach((key, _) => (success = success && removeItem(key)));
    return success;
  };

  const clearAllItems = function <K extends keyof StorageItem>(
    keys: K[]
  ): boolean {
    if (!isLocalStorageAvailable) return false;

    let success = true;
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LocalStoragePrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear all localStorage items:", error);
      success = false;
    }

    return success;
  };

  return {
    isLocalStorageAvailable,
    getItemByKey,
    getItemsByKeys,
    getAllItems,
    setItem,
    setItems,
    hasItem,
    removeItem,
    removeItems,
    clearAllItems,
  };
};
