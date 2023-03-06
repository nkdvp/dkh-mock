export interface Time {
  milliseconds?: number;
  seconds?: number;
  minutes?: number;
}

export default interface Cache {
  getData: (
    identifier: string,
    args: any[],
    refreshCycle: Time,
    expireCycle: Time,
    callback: any,
  ) => Promise<any>;
}
