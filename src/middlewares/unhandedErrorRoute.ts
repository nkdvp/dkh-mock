import {
  Request, Response,
} from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('unhandedErrorRoute.ts');
async function errorHandler(err: any, req: Request, res: Response) {
  logger.error('UNHANDED ERROR', err);
  return res.status(500).json({
    success: false,
    message: 'Unhanded Error',
    code: langs.INTERNAL_SERVER_ERROR,
    data: err,
  });
}
export default errorHandler;
