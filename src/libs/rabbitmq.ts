import RabbitMQ, { Channel } from 'amqplib';
import { randomUUID } from 'crypto';
import {
  defaultOptions,
  defaultConfig,
  RabbitConfig,
  RabbitConsumer,
  RabbitCounters,
  RabbitOptions,
  RabbitTimeoutHandler,
  defaultTimeoutHandler,
  defaultCounters,
  TimeoutChecker,
} from '../interfaces/rabbitmq';
import Logger from './logger';

const logger = Logger.create('rabbitmq');

// @done
const createTimeoutChecker = (): TimeoutChecker => {
  const checker = {
    id: randomUUID(),
    startAt: Date.now(),
  };
  return checker;
};

class Listener {
  _config: RabbitConfig;

  _options: RabbitOptions;

  _counters: RabbitCounters;

  _timeoutHandler: RabbitTimeoutHandler;

  _channel: Channel;

  _consumerTag: string;

  constructor(
    rabbitConfig: RabbitConfig = defaultConfig,
    options: RabbitOptions = defaultOptions,
    counters: RabbitCounters = defaultCounters,
    timeoutHandler: RabbitTimeoutHandler = defaultTimeoutHandler,
  ) {
    this._config = rabbitConfig;
    this._options = options;
    this._counters = counters;
    this._timeoutHandler = timeoutHandler;
  }

  // @done
  /**
   * Start consuming messages from queue
   */
  async start(consumerObject: RabbitConsumer) {
    const conn = await RabbitMQ.connect(`amqp://${this._config.host}:${this._config.port}`);
    const channel = await conn.createChannel();
    await channel.prefetch(this._options.QoS);
    await channel.assertExchange(this._config.exchangeName, this._config.exchangeType);
    await channel.assertQueue(this._config.queueName);
    await channel.bindQueue(
      this._config.queueName,
      this._config.exchangeName,
      this._config.exchangePattern,
    );

    this._channel = channel;
    try {
      // CAN_RAISE_EXCEPTION
      await consumerObject.before();
    } catch (err) {
      logger.error('before() raises error: ', err.message);
    }
    channel.consume(this._config.queueName, async (msg) => {
      this._reduceCounterVariablesIfNeeded();
      this._consumerTag = msg.fields.consumerTag;
      this._counters.receivedCount += 1;

      const timeoutChecker = createTimeoutChecker();
      this._timeoutHandler.checkerList.push(timeoutChecker);

      // [STEP 1] send ACK when processing count < processing threshold
      Listener.ackMessage(msg, this);

      // CAN_RAISE_EXCEPTION
      const msgPayload = JSON.parse((msg?.content || {}).toString());

      const lstRetry = msgPayload.retryCount || 0;
      delete msgPayload.retryCount;

      // [STEP 2] process msg and get back result
      let processResult = false;
      try {
        // CAN_RAISE_EXCEPTION
        processResult = await consumerObject.process(msgPayload);
      } catch (err) {
        processResult = false;
        try {
          // CAN_RAISE_EXCEPTION
          await consumerObject.catch(err);
        } catch (e) {
          logger.error('catch() raises error: ', e.message);
        }
      }

      // [STEP 3] requeue msg if needed
      if (processResult) {
        try {
          // CAN_RAISE_EXCEPTION
          await consumerObject.resolve();
        } catch (err) {
          logger.info('resolve() raises error: ', err.message);
        }
      } else {
        msgPayload.retryCount = lstRetry + 1;
        if (msgPayload.retryCount <= this._options.maxRetryCount) {
          await Listener.sendMessageToQueue(msgPayload, this);
        }
        try {
          await consumerObject.reject();
        } catch (err) {
          logger.error('reject() raises error: ', err.message);
        }
      }

      this._removeTimeoutCheck(timeoutChecker.id);
      this._counters.processedCount += 1;
    });
  }

  // @done
  _reduceCounterVariablesIfNeeded() {
    const lowerBound = Math.min(
      this._counters.receivedCount,
      this._counters.processedCount,
      this._counters.ackCount,
    );
    const upperBound = Math.max(
      this._counters.receivedCount,
      this._counters.processedCount,
      this._counters.ackCount,
    );

    if (upperBound > this._counters.counterLimit) {
      this._counters.receivedCount -= lowerBound;
      this._counters.processedCount -= lowerBound;
      this._counters.ackCount -= lowerBound;
    }
  }

  // @done
  static async ackMessage(msg: any, listener: Listener) {
    const processingCount = listener._counters.receivedCount - listener._counters.processedCount;
    if (processingCount < listener._options.processingThreshold || listener._timeoutOccurred()) {
      try {
        // CAN_RAISE_EXCEPTION
        await listener._channel.ack(msg);
      } catch (err) {
        setTimeout(async () => {
          await Listener.ackMessage(msg, listener);
        }, 100);
        return;
      }
      listener._updateAckCounter();
    } else {
      setTimeout(async () => {
        await Listener.ackMessage(msg, listener);
      }, 100);
    }

    /*
      Once timeout occurs:
      - Stop receiving messages
      - Send all remaining ACKs
      - Terminate process
      */

    if (listener._timeoutOccurred() && !listener._timeoutHandler.consumerCancelled) {
      listener._cancelConsuming();
      Listener._cancelChannel(listener);
      setTimeout(async () => {
        await Listener._terminateProcess(listener);
      }, listener._options.delayBeforeTerminateInMillis);
    }
  }

  // @done
  _timeoutOccurred() {
    const currentTimestamp = Date.now();
    return this._timeoutHandler.checkerList.some(
      (c) => currentTimestamp - c.startAt > this._options.timeoutThresholdInMillis,
    );
  }

  // @done
  _updateAckCounter() {
    this._counters.ackCount += 1;
  }

  // @done
  _cancelConsuming() {
    this._timeoutHandler.consumerCancelled = true;
  }

  // @done
  static async _cancelChannel(listener: Listener) {
    try {
      // CAN_RAISE_EXCEPTION
      listener._channel.cancel(listener._consumerTag);
    } catch (err) {
      setTimeout(async () => {
        await Listener._cancelChannel(listener);
      }, 100);
    }
  }

  // @done
  static async _terminateProcess(listener: Listener) {
    /*
      Terminate process only when all remaining ACKs have been sent
      */
    if (listener._counters.ackCount === listener._counters.receivedCount) {
      logger.info('[LISTENER] Timeout occurred, terminating process');
      process.exit(1);
    } else {
      setTimeout(async () => {
        await Listener._terminateProcess(listener);
      }, 100);
    }
  }

  // @done
  _removeTimeoutCheck(id: string) {
    const index = this._timeoutHandler.checkerList.findIndex((c) => c.id === id);
    if (index < 0) { return; }
    this._timeoutHandler.checkerList.splice(index, 1);
  }

  // @done
  static async sendMessageToQueue(msgPayload: object, listener: Listener) {
    try {
      // CAN_RAISE_EXCEPTION
      await listener._channel.sendToQueue(
        listener._config.queueName,
        Buffer.from(JSON.stringify(msgPayload)),
      );
    } catch (err) {
      setTimeout(async () => {
        await Listener.sendMessageToQueue(msgPayload, listener);
      }, 100);
    }
  }
}

export default Listener;
