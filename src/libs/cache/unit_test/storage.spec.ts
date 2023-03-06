/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
import { expect } from 'chai';
import Storage, { StorageData } from '../interface/storage';
import implementStorage from '../implement/storage.impl';

describe('Get', () => {
  it('Same key, same args should return same value', async () => {
    const storage: Storage = implementStorage(100);

    storage.set('earth', {
      args: ['water', 'fire'],
      expiredAtInMillis: 1,
      refreshAtInMillis: 1,
      response: 'This is the correct value',
    });
    const result: StorageData = storage.get('earth', ['water', 'fire']);

    expect(result.response).to.equal('This is the correct value');
  });

  it('Same key, different args should return different value', async () => {
    const storage: Storage = implementStorage(100);

    storage.set('earth', {
      args: ['water', 'fire'],
      expiredAtInMillis: 1,
      refreshAtInMillis: 1,
      response: 'Yep that is the earth',
    });
    const result: StorageData = storage.get('earth', ['sky', 'ocean']);

    expect(result).to.equal(null);
  });
});

describe('Set', () => {
  it('Random keys should be removed once the size is too big', () => {
    const size = 1000;
    const storage: Storage = implementStorage(size);
    const currentMillis: number = new Date().getTime();

    for (let i = 0; i < size * 2; i += 1) {
      storage.set(`key${i}`, {
        args: [],
        expiredAtInMillis: currentMillis + 100000,
        refreshAtInMillis: currentMillis + 100000,
        response: `val${i}`,
      });
    }
    const result: number = storage.size();

    expect(result).to.be.below(size + size / 2);
  });
});
