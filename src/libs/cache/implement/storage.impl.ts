/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import lodash from 'lodash';
import Storage, { StorageData } from '../interface/storage';

function currentMillis(): number {
  return new Date().getTime();
}

export default function implementStorage(maxSize: number): Storage {
  const store = new Map<string, StorageData>();
  const refresh = new Set<string>();

  const get = (k: string, args: any): StorageData => {
    const storeData: StorageData = store.get(k);
    if (storeData === undefined
      || storeData === null
      || JSON.stringify(storeData.args) !== JSON.stringify(args)) {
      return null;
    }
    return storeData;
  };

  const shuffle = (array: number[]): number[] => {
    const result = lodash.cloneDeep(array);
    for (let i = 0; i < array.length; i++) {
      const j = Math.floor(Math.random() * array.length);
      const tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  };

  const removeRandomKeys = () => {
    const keysToDel: string[] = [];
    const layersToDelete: number[] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5);
    store.forEach((val: StorageData, key: string) => {
      if (val.expiredAtInMillis <= currentMillis() || layersToDelete.includes(val.layer)) {
        keysToDel.push(key);
      }
    });
    keysToDel.forEach((key: string) => {
      store.delete(key);
    });
  };

  const set = (k: string, v: StorageData) => {
    v.layer = Math.floor(Math.random() * 10);
    if (store.size >= maxSize + maxSize / 2) {
      removeRandomKeys();
    }
    store.set(k, v);
  };

  const startRefreshing = (k: string): void => {
    refresh.add(k);
  };

  const stopRefreshing = (k: string): void => {
    refresh.delete(k);
  };

  const isRefreshing = (k: string): boolean => refresh.has(k);

  const size = (): number => store.size;

  return {
    set,
    get,
    startRefreshing,
    stopRefreshing,
    isRefreshing,
    size,
  };
}
