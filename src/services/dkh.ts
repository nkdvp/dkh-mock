import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('healthcheck.ts');
const apis: ExpressHandler[] = [
  {
    path: '/healthcheck/liveness',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/healthcheck/readiness',
    method: 'GET',
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
];
export default apis;
