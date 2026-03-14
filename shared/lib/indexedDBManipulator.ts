"use client";

import { IndexedDBItem, IndexedDBKey } from "@shared/types/indexedDB.type";
import {
  clear,
  del,
  delMany,
  entries,
  get,
  getMany,
  set,
  setMany,
} from "idb-keyval";

export class IndexedDBManipulator {
  private static readonly IndexedDBPrefix = "notezy_";

  private static getIndexedDBKey(key: IndexedDBKey): string {
    return this.IndexedDBPrefix + key;
  }

  static isIndexedDBAvailable = (): boolean => {
    try {
      const testKey = "__test__";
      set(testKey, "test");
      del(testKey);
      return true;
    } catch {
      console.error(`The indexedDB is not available`);
      return false;
    }
  };

  static getItemByKey = async <K extends IndexedDBKey>(
    key: K
  ): Promise<IndexedDBItem[K] | null> => {
    try {
      if (!this.isIndexedDBAvailable()) return null;
      const indexedDBKey = this.getIndexedDBKey(key);
      const result = await get(indexedDBKey);
      return result === undefined ? null : (result as IndexedDBItem[K] | null);
    } catch (error) {
      console.error(
        `Failed to get indexedDB item with key of "${key}":`,
        error
      );
      return null;
    }
  };

  static getItemsByKeys = async <K extends IndexedDBKey>(
    keys: K[]
  ): Promise<IndexedDBItem[K][] | null> => {
    try {
      if (!this.isIndexedDBAvailable()) return null;
      const indexedDBKeys = keys.map(key => this.getIndexedDBKey(key));
      const result = await getMany(indexedDBKeys);
      return result === undefined
        ? null
        : (result as IndexedDBItem[K][] | null);
    } catch (error) {
      console.error(
        `Failed to get indexedDB items with keys of "${keys}":`,
        error
      );
      return null;
    }
  };

  static async getAllItems(): Promise<Partial<IndexedDBItem>> {
    if (!this.isIndexedDBAvailable()) return {} as Partial<IndexedDBItem>;
    const result = {} as Partial<IndexedDBItem>;
    try {
      const allEntries = await entries();
      allEntries.forEach(([key, value]) => {
        if (typeof key === "string" && key.startsWith(this.IndexedDBPrefix)) {
          const cleanKey = key.replace(
            this.IndexedDBPrefix,
            ""
          ) as IndexedDBKey;
          result[cleanKey] = value;
        }
      });
    } catch (error) {
      console.error("Failed to get all indexedDB items:", error);
    }
    return result;
  }

  static async hasItem<K extends IndexedDBKey>(key: K): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    const item = await this.getItemByKey(key);
    return item !== null && item !== undefined;
  }

  static async setItem<K extends IndexedDBKey>(
    key: K,
    value: IndexedDBItem[K]
  ): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    try {
      const indexedDBKey = this.getIndexedDBKey(key);
      await set(indexedDBKey, value);
      return true;
    } catch (error) {
      console.error(
        `Failed to set indexedDB item with key of "${key}":`,
        error
      );
      return false;
    }
  }

  static async setItems(items: Partial<IndexedDBItem>): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    try {
      const entriesArr: [string, any][] = Object.entries(items)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [
          this.getIndexedDBKey(key as IndexedDBKey),
          value,
        ]);
      await setMany(entriesArr);
      return true;
    } catch (error) {
      console.error("Failed to set multiple indexedDB items:", error);
      return false;
    }
  }

  static async removeItem<K extends IndexedDBKey>(key: K): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    try {
      const indexedDBKey = this.getIndexedDBKey(key);
      await del(indexedDBKey);
      return true;
    } catch (error) {
      console.error(
        `Failed to remove indexedDB item with key of "${key}":`,
        error
      );
      return false;
    }
  }

  static async removeItems<K extends IndexedDBKey>(
    keysArr: K[]
  ): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    try {
      const indexedDBKeys = keysArr.map(key => this.getIndexedDBKey(key));
      await delMany(indexedDBKeys);
      return true;
    } catch (error) {
      console.error("Failed to remove indexedDB items:", error);
      return false;
    }
  }

  static async clearAllItems(): Promise<boolean> {
    if (!this.isIndexedDBAvailable()) return false;
    try {
      await clear();
      return true;
    } catch (error) {
      console.error("Failed to clear all indexedDB items:", error);
      return false;
    }
  }
}
