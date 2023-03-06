import {
  Request, Response,
} from 'express';
import Logger from '../libs/logger';

const logger = Logger.create('defaultRoute.ts');
async function notFound(req: Request, res: Response) {
  logger.info('ROUTE NOT FOUND', req.originalUrl);
  return res.status(404).json({
    success: false,
    code: 'API_NOT_FOUND',
    message: 'Api Not Found',
  });
}
export default notFound;
