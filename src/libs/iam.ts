import verifyTokensModel from '../models/verifyToken.model';
import { sessionExpireTime } from '../constants/iam';
import Logger from './logger';

const logger = Logger.create('IAM_LIBS');

export const extendSessionValidTime = async (sessionId: string, csrf1: string) => {
  try {
    const present = new Date();
    const record = await verifyTokensModel
      .findOneAndUpdate(
        {
          sessionId,
          csrf1,
          sessionExpiredAt: {
            $lte: present,
          },
        },
        {
          sessionExpiredAt: new Date(Date.now() + sessionExpireTime),
        },
        {
          new: true,
        },
      )
      .lean();
    if (record) return record;
  } catch (err) {
    logger.error('extend session valid time failed: ', err.message);
  }
  return null;
};
