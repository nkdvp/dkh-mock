/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
import { expect } from 'chai';
import Cache from '../interface/cache';
import implementCache from '../implement/cache.impl';
import Storage, { StorageData } from '../interface/storage';
import implementStorage from '../implement/storage.impl';

describe('Hit and miss', () => {
  it(`If the key is missing, the cache should
  invoke the callback to fetch the value, then return that value`, async () => {
    const md5: any = (v: string) => v;
    const storage: Storage = implementStorage(10);
    const args = ['sun', 'moon'];
    const cache: Cache = implementCache(md5, storage);

    await cache.getData(
      'UNIVERSE',
      args,
      {},
      {},
      (sun: string, moon: string): any => `The earth doesn't need ${sun} and ${moon}`,
    );
    const result: string = await cache.getData(
      'universe',
      args,
      {},
      {},
      (sun: string, moon: string): any => `The earth need ${sun} and ${moon}`,
    );

    expect(result).to.equal('The earth need sun and moon');
  });

  it(`If the key is hit, the value saved in the cache 
  should be returned immediately without invoking the callback`, async () => {
    const md5: any = (v: string) => v;
    const storage: Storage = implementStorage(10);
    const args = ['sun', 'moon'];
    const cache: Cache = implementCache(md5, storage);

    await cache.getData(
      'universe',
      args,
      {
        seconds: 10,
      },
      {
        seconds: 20,
      },
      (sun: string, moon: string): any => `The earth need ${sun} and ${moon}`,
    );
    const result: string = await cache.getData(
      'universe',
      args,
      {},
      {},
      (sun: string, moon: string): any => `The earth doesn't need ${sun} and ${moon}`,
    );

    expect(result).to.equal('The earth need sun and moon');
  });
});

const sleep = (millis: any) => {
  const date: any = new Date();
  let curDate: any = null;
  do { curDate = new Date(); }
  while (curDate - date < millis);
};

describe('Expired', () => {
  it(`If the key is expired, the cache should invoke the
   callback to fetch the value, then return that value`, async () => {
    const md5: any = (v: string) => v;
    const storage: Storage = implementStorage(100);
    const cache: Cache = implementCache(md5, storage);

    await cache.getData(
      'hello world',
      [],
      {
        milliseconds: 1,
      },
      {
        milliseconds: 2,
      },
      (): any => 'This is the wrong value',
    );
    sleep(3);

    const result: string = await cache.getData(
      'hello world',
      [],
      {},
      {},
      (): any => 'This is the correct value',
    );

    expect(result).to.equal('This is the correct value');
  });
});

describe('Need refresh', () => {
  it(`If the key need to be refreshed, the value saved in the cache should be 
  returned immediately, then the cache should asynchronously invoke the callback 
  to fetch the new value, then save that value`, async () => {
    const md5: any = (v: string) => v;
    const currentMillis = new Date().getTime();
    const storage: Storage = {
      set: (k: string, v: StorageData) => ({}),
      get: (k: string, args: any) => ({
        args: [],
        response: 'This is the correct value',
        expiredAtInMillis: currentMillis + 1000,
        refreshAtInMillis: currentMillis - 1,
      }),
      startRefreshing: (k: string) => ({}),
      stopRefreshing: (k: string) => ({}),
      isRefreshing: (k: string) => (true),
      size: () => 1,
    };
    const cache: Cache = implementCache(md5, storage);

    let callbackInvoked = false;
    const result: string = await cache.getData(
      'hello world',
      [],
      {},
      {},
      (): any => {
        callbackInvoked = true;
        return 'This is the value after refreshing';
      },
    );

    expect(result).to.equal('This is the correct value');
    (async () => {
      expect(callbackInvoked).to.equal(true);
    })();
  });
});
