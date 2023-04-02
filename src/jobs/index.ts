import Logger from '../libs/logger';
import { getTokens, jobGetTokens, parseCookieStringToObj, updateReturnField } from './dkhTokens';

const logger = Logger.create('jobs/index.ts');
const startOtherJobs = false;
async function runJobs() {
  try {
    logger.info('Start runJobs');
    const refreshDb = process.env.RUN_ENSURE_JOBS || 'false';
    /// ///// BEFORE CACHE ////////
    // if (refreshDb === 'true') {}
    /// ///// CACHE /////////////
    // jobGetTokens();
    // updateReturnField();
  } catch (e) {
    logger.error('Run Jobs Error', e.message);
  }
}
export { runJobs, startOtherJobs };
