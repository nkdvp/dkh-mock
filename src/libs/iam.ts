import verifyTokensModel from '../models/verifyToken.model';
import { sessionExpireTime } from '../constants/iam';
import Logger from './logger';

const logger = Logger.create('IAM_LIBS');

export const extendSessionValidTime = async (sessionId: string, csrf1: string) => {
  try {
    await verifyTokensModel.updateOne(
      {
        sessionId,
        csrf1,
      },
      {
        sessionExpiredAt: new Date(Date.now() + sessionExpireTime),
      },
    );
  } catch (err) {
    logger.error('extend session valid time failed: ', err.message);
  }
};
