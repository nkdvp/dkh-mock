import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import subjectsModel from '../models/subjects.model';
import studentSubjectsModel from '../models/studentSubject.model';
import studentSelectionModel from '../models/studentSelection.model';
import verifyTokensModel from '../models/verifyToken.model';
import usersModel from '../models/users.model';
import { v4 as uuid } from 'uuid';
import { sessionExpireTime } from '../constants/iam';
import { extendSessionValidTime } from '../libs/iam';
import { Response } from 'express';

const logger = Logger.create('dkh.ts');

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
  // doing login get
  {
    path: '/dang-nhap',
    method: 'GET',
    params: {
      // $$strict: true,
      // userId: 'string',
      // password: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const present = new Date();
        const tokenRecord = await verifyTokensModel
          .findOneAndUpdate(
            {},
            {
              returnAt: present,
            },
            { new: true },
          )
          .sort({ returnAt: 1 })
          .lean();
        if (tokenRecord.returnAt.getTime() !== present.getTime()) return errorGetTokenAgain(res);

        res.cookie('__RequestVerificationToken', tokenRecord.csrf1);
        res.cookie('__RequestVerificationToken2', tokenRecord.csrf2);
        // logger.info('token record: ', tokenRecord);

        return okResponse(res, 'Get cookie done');
        // TODO: return __RequestVerificationToken,
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // doing login post
  {
    path: '/dang-nhap',
    method: 'POST',
    params: {
      // $$strict: true,
      // userId: 'string',
      // password: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // logger.info('cookie: ', req.cookies);
        // logger.info('headers:', req.headers);
        // logger.info('body: ', req.body);
        const csrf1 = req.cookies?.__RequestVerificationToken;
        const csrf2 = req.body?.__RequestVerificationToken;
        const userId = req.body?.LoginName;
        const password = req.body?.Password;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];

        const validIAM = await usersModel.findOne({ userId, password }).lean();
        if (!validIAM) return res.status(500).send('userId or password invalid');

        if (!csrf1 || !csrf2 || !userId || !password) return errorGetTokenAgain(res);
        if (sessionId) {
          const loginRecord = await verifyTokensModel.findOne({ csrf1, csrf2, sessionId });
          if (!loginRecord) return errorUnknownError(res);
          return okResponse(res, 'Login already');
        }
        const newSessionId = uuid();

        const takePlace = await verifyTokensModel
          .findOneAndUpdate(
            {
              csrf1: csrf1,
              csrf2: csrf2,
              $or: [
                { sessionId: null },
                {
                  sessionExpiredAt: {
                    $lte: new Date(),
                  },
                },
              ],
            },
            {
              userId,
              sessionId: newSessionId,
              sessionExpiredAt: new Date(Date.now() + sessionExpireTime),
            },
            {
              new: true,
            },
          )
          .lean();
        if (takePlace.sessionId === newSessionId) res.cookie('ASP.NET_SessionId', newSessionId);
        else return errorGetTokenAgain(res);
        // logger.info('sessionId: ', newSessionId);
        return okResponse(res, 'Logged in');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // doing list subjects
  {
    path: '/danh-sach-mon-hoc/:id',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const csrf1 = req.cookies?.__RequestVerificationToken;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        const listSubjects = await subjectsModel.find().select({ _id: 0, __v: 0 }).lean();
        if (!listSubjects) return errorUnknownError(res);

        return okResponse(res, listSubjects);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // doing list subjects registered
  {
    path: '/danh-sach-mon-hoc-da-dang-ky',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const csrf1 = req.cookies?.__RequestVerificationToken;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        const listSubjects = await studentSubjectsModel.find().select({ _id: 0, __v: 0 }).lean();
        const listSubjectsSelected = await studentSelectionModel
          .find()
          .select({ _id: 0, __v: 0 })
          .lean();
        const result = { listSubjects, listSubjectsSelected };

        return res.status(200).send(result);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // doing select a subject
  {
    path: '/chon-mon-hoc/',
    method: 'POST',
    params: {
      $$strict: true,
      subject_code: 'number',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const csrf1 = req.cookies?.__RequestVerificationToken;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        // TODO: should use cache
        const userId = isExtendedSucceed.userId;
        const { subject_code } = req.body;

        // validate subject_code
        // select subject for student
        try {
          await studentSelectionModel.insertMany([
            {
              userId: userId,
              subject_code,
            },
          ]);
        } catch (err) {
          logger.error('register');
        }

        return okResponse(res, 'select done');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // doing confirm selection
  {
    path: '/xac-nhan-dang-ky',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const csrf1 = req.cookies?.__RequestVerificationToken;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        const userId = isExtendedSucceed.userId;
        const listSubjectsSelected = await studentSelectionModel
          .find({
            userId,
          })
          .lean();
        const updateArray = listSubjectsSelected.map((elem) => ({
          userId: elem.userId,
          subject_code: elem.subject_code,
        }));
        const selectionIds = listSubjectsSelected.map((elem) => elem._id);
        try {
          await studentSubjectsModel.insertMany(updateArray);
          // TODO: trigger count in subject table
          await studentSelectionModel.deleteMany({
            _id: {
              $in: selectionIds,
            },
          });
        } catch (err) {
          logger.error('confirm failed: ', err.message);
          return errorUnknownError(res);
        }

        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },

  // custom apis
  // create a subject
  {
    path: '/subjects',
    method: 'POST',
    params: {
      $$strict: true,
      subject_code: 'number',
      subject_name: 'string',
      subject_lecture: 'string',
      subject_schedule: 'string',
      limit_student: 'number|optional',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // const { subject_code, subject_name, subject_lecture, subject_schedule } = req.body;
        const subject_code: number = req.body.subject_code;
        const subject_name: string = req.body.subject_name;
        const subject_lecture: string = req.body.subject_lecture;
        const subject_schedule: string = req.body.subject_schedule;
        const limit_student: number = req.body.limit_student;
        try {
          await subjectsModel.insertMany([
            {
              subject_code,
              subject_name,
              subject_lecture,
              subject_schedule,
              limit_student,
            },
          ]);
          logger.info('insert succeed');
        } catch (err) {
          logger.warn('insert subject failed: ', err.message);
        }

        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
];
export default apis;
