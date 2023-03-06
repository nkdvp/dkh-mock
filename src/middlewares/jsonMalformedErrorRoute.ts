import {
  Request, Response, NextFunction,
} from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('malformedJsonMiddleware.ts');

async function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('MALFORMED JSON ERROR', err);
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON in request body',
      code: langs.MALFORMED_JSON_REQUEST_BODY,
      data: err.message,
    });
  }
  return next();
}
export default errorHandler;
