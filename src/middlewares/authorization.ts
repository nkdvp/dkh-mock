import { Request, Response, NextFunction } from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('authorization');
async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    // permission check
    logger.info('Authorization middleware');
    return next();
  } catch (e) {
    logger.error('Authorization Error', e.message);
    return res.status(403).json({
      success: false,
      message: langs.PERMISSION_DENIED,
      code: langs.PERMISSION_DENIED,
      status: langs.PERMISSION_DENIED,
    });
  }
}
export default verify;
