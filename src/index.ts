/* eslint-disable import/first */
import * as apmAgent from 'elastic-apm-node/start';
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
apmAgent;
import cluster from 'cluster';
import os from 'os';
import ExpressServer from './express';
import mongodb from './libs/mongodb';
import Logger from './libs/logger';
import { runJobs } from './jobs';

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
  runJobs();
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
