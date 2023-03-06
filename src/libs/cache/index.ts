import md5 from 'md5';
import Cache from './interface/cache';
import implementCache from './implement/cache.impl';
import Storage from './interface/storage';
import implementStorage from './implement/storage.impl';

export default function initCache(size: number): Cache {
  const storage: Storage = implementStorage(size);
  const cache: Cache = implementCache(md5, storage);
  return cache;
}
