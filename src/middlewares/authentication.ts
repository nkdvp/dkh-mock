import { Request, Response, NextFunction } from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('authentication');
async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    // token check
    logger.info('Authentication middleware');
    return next();
  } catch (e) {
    logger.error('Authentication Error', e.message);
    return res.status(401).json({
      success: false,
      message: langs.INVALID_OR_EXPIRED_TOKEN,
      code: langs.INVALID_OR_EXPIRED_TOKEN,
      status: langs.UNAUTHORIZED,
    });
  }
}
export default verify;
