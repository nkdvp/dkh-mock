/* eslint-disable import/first */
import * as apmAgent from 'elastic-apm-node/start';
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
apmAgent;
import cluster from 'cluster';
import os from 'os';
import ExpressServer from './express';
import mongodb from './libs/mongodb';
// import mysql from './libs/mysql';
// import kafkaConsumer from './libs/kafkajsConsumer';
// import kafkaProducer from './libs/kafkajsProducer';
// import redis from './libs/redis';
import Logger from './libs/logger';

const logger = Logger.create('index.ts');
async function start() {
  logger.info(`>>>>>>>>>>${process.env.npm_package_name.toUpperCase()}<<<<<<<<<<`);
  // >>>>>>MONGODB
  mongodb();
  // >>>>>>MYSQL
  // const sqlConnection: any = await mysql;
  // await sqlConnection.execute('');
  // >>>>>>EXPRESS
  ExpressServer();
  // >>>>>> REDIS
  // const redisClient = redis.getClient();
  // await redisClient.setex('key', 10, 'true');
  // const bool = await redisClient.get('key') || false;
  // logger.info('redis check', bool);
  // >>>>>KAFKA PRODUCER
  // setTimeout(async () => {
  //   await kafkaProducer.send({
  //     topic: process.env.KAFKA_TOPIC,
  //     messages: [{
  //       key: 'test-kafka',
  //       value: JSON.stringify({ message: 'test kafka', success: 'true' }),
  //     }],
  //     acks: 1,
  //     timeout: 3000,
  //   });
  // }, 3000);
  // // >>>>>KAFKA CONSUMER
  // await kafkaConsumer.subscribe(
  //   { topic: process.env.KAFKA_TOPIC, fromBeginning: true },
  // );
  // await kafkaConsumer.run({
  //   partitionsConsumedConcurrently: parseInt(process.env.KAFKA_PARTITION_NUMBER, 10) || 3,
  //   eachMessage: async ({ topic, partition, message }) => {
  //     // auto ack
  //     try {
  //       logger.info('Consumer Message', {
  //         topic,
  //         partition,
  //         offset: message.offset,
  //         value: JSON.parse(message.value.toString()),
  //       });
  //     } catch (e) {
  //       logger.info('CONSUME MESSAGE ERROR', e);
  //     }
  //   },
  // });
}

let numOfCpu = os.cpus().length / 2;
const clusterFlag = !!process.env.ENABLE_CLUSTER;
if (clusterFlag && numOfCpu > 2) {
  const max = +process.env.MAXIMUM_CLUSTER || 2;
  if (numOfCpu > max) { numOfCpu = max; }
  if (cluster.isPrimary) {
    logger.info(`Master ${process.pid} is running`);
    for (let i = 0; i < numOfCpu; i += 1) {
      cluster.fork();
    }
    // global catch
    cluster.on('exit', (worker, code, signal) => {
      logger.error('Worker', worker.id, ' has exited by signal', signal, 'code', code);
      cluster.fork();
    });
  } else {
    logger.info(`Worker ${process.pid} started`);
    start();
  }
} else {
  start();
}
