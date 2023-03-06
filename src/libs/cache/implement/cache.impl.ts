/* eslint-disable no-case-declarations */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Cache, { Time } from '../interface/cache';
import Storage, { StorageData } from '../interface/storage';

function toMillis(time: Time) {
  const millis = time.milliseconds || 0;
  const seconds = time.seconds || 0;
  const minutes = time.minutes || 0;
  return minutes * 60000 + seconds * 1000 + millis;
}

export default function implementCache(md5: any, storage: Storage): Cache {
  async function getData(
    identifier: string,
    args: any[],
    refreshCycle: Time,
    expireCycle: Time,
    callback: any,
  ): Promise<any> {
    const key: string = identifier + md5(args);
    const currentMillis = new Date().getTime();
    const expire = toMillis(expireCycle);
    const refresh = Math.min(toMillis(refreshCycle), expire);

    let cacheHitStatus: string;
    const cacheData: StorageData = storage.get(key, args);
    if (cacheData === null) {
      cacheHitStatus = 'MISS';
    } else if (currentMillis >= cacheData.expiredAtInMillis) {
      cacheHitStatus = 'EXPIRED';
    } else if (currentMillis < cacheData.refreshAtInMillis) {
      cacheHitStatus = 'HIT';
    } else if (storage.isRefreshing(key)) {
      cacheHitStatus = 'REFRESHING';
    } else {
      cacheHitStatus = 'NEED_REFRESH';
    }

    switch (cacheHitStatus) {
      case 'REFRESHING':
      case 'HIT':
        return cacheData.response;
      case 'NEED_REFRESH':
        (async () => {
          storage.startRefreshing(key);
          const data = await callback(...args);
          if (data !== undefined && data !== null) {
            storage.set(key, {
              args,
              expiredAtInMillis: currentMillis + expire,
              refreshAtInMillis: currentMillis + refresh,
              response: data,
            });
          }
          storage.stopRefreshing(key);
        })();
        return cacheData.response;
      case 'MISS':
      case 'EXPIRED':
        // TODO: xu ly giong nhu refresh
        const data = await callback(...args);
        if (data !== undefined && data !== null) {
          storage.set(key, {
            args,
            expiredAtInMillis: currentMillis + expire,
            refreshAtInMillis: currentMillis + refresh,
            response: data,
          });
          return data;
        }
        return null;
      default:
        // Cannot reach
        return null;
    }
  }

  return {
    getData,
  };
}
