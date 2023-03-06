export interface RabbitConsumer {
  process: (msg: object) => any;
  resolve: () => any;
  reject: () => any;
  catch: (err: Error) => any;
  before: () => any;
}

export interface RabbitConfig {
  host: string;
  port: number;
  queueName: string;
  exchangeName: string;
  exchangeType: string;
  exchangePattern: string;
}

/*
  {QoS} should be greater than {processingThreshold}
*/
export interface RabbitOptions {
  maxRetryCount: number;
  processingThreshold: number;
  QoS: number;
  timeoutThresholdInMillis: number;
  delayBeforeTerminateInMillis: number;
}

export interface RabbitCounters {
  counterLimit: number;
  receivedCount: number;
  ackCount: number;
  processedCount: number;
}

export interface TimeoutChecker {
  id: string;
  startAt: number;
}

export interface RabbitTimeoutHandler {
  checkerList: Array<TimeoutChecker>;
  consumerCancelled: boolean;
}

//------------------------------------------------------

const defaultConfig: RabbitConfig = {
  host: '',
  port: 0,
  queueName: '',
  exchangeName: '',
  exchangeType: '',
  exchangePattern: '',
};

const defaultOptions: RabbitOptions = {
  maxRetryCount: 0,
  timeoutThresholdInMillis: 1200000, // 12 minutes
  delayBeforeTerminateInMillis: 300000, // 5 minutes
  processingThreshold: 3,
  QoS: 10,
};

const defaultCounters: RabbitCounters = {
  counterLimit: 1000000,
  receivedCount: 0,
  ackCount: 0,
  processedCount: 0,
};

const defaultTimeoutHandler: RabbitTimeoutHandler = {
  checkerList: [],
  consumerCancelled: false,
};

export {
  defaultConfig,
  defaultOptions,
  defaultCounters,
  defaultTimeoutHandler,
};
