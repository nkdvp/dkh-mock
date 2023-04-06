import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import usersModel from '../models/users.model';
import verifyTokensModel from '../models/verifyToken.model';
import { Response } from 'express';

const logger = Logger.create('users.ts');

const errorCookieInvalid = (res: Response) => {
  return res.status(500).send('Cookie invalid');
};
const errorGetTokenAgain = (res: Response) => {
  return res.status(500).send('Get token again');
};
const errorUnknownError = (res: Response) => {
  return res.status(500).send('Something is broken');
};
const okResponse = (res: Response, data: any = null) => {
  if (data) return res.status(200).send(data);
  return res.status(200);
};

const apis: ExpressHandler[] = [
  // create user
  {
    path: '/users',
    method: 'POST',
    params: {
      $$strict: true,
      userId: 'string',
      username: 'string',
      meta: 'object',
      password: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const { userId, username, meta, password } = req.body;
        await usersModel.insertMany([
          {
            userId,
            username,
            meta,
            password,
          },
        ]);
        return res.status(200).send('create user done');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // get list user
  {
    path: '/users',
    method: 'GET',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const list = await usersModel.find({}).lean();
        return res.status(200).send(list);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
];
export default apis;
