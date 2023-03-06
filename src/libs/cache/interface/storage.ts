export interface StorageData {
  args: any;
  response: any;
  expiredAtInMillis: number;
  refreshAtInMillis: number;
  layer?: number;
}

export default interface Storage {
  set: (k: string, v: StorageData) => void;
  get: (k: string, args: any) => StorageData;
  startRefreshing: (k: string) => void;
  stopRefreshing: (k: string) => void;
  isRefreshing: (k: string) => boolean;
  size: () => number;
}
