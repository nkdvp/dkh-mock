import { ExpressHandler, commonResponse } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import subjectsModel from '../models/subjects.model';
import studentSubjectsModel from '../models/studentSubject.model';
import studentSelectionModel from '../models/studentSelection.model';
import verifyTokensModel from '../models/verifyToken.model';
import usersModel from '../models/users.model';
import { v4 as uuid } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { csrf1CookieName, csrf2CookieName, sessionCookieName, sessionExpireTime } from '../constants/iam';
import { extendSessionValidTime } from '../libs/iam';
import {
  errorCookieInvalid,
  errorGetTokenAgain,
  errorSessionExpired,
  errorSubjectInvalid,
  errorUnknownError,
  okResponse,
} from '../libs/responseFunctions';

const logger = Logger.create('dkh.ts');

const apis: ExpressHandler[] = [
  // done login get
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

        res.cookie(csrf1CookieName, tokenRecord.csrf1);
        res.cookie(csrf2CookieName, tokenRecord.csrf2);
        // logger.info('token record: ', tokenRecord);

        return okResponse(res, 'Get cookie done');
        // TODO: return __RequestVerificationToken,
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // done login post
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
        const sessionId = req.cookies?.[sessionCookieName];

        const validIAM = await usersModel.findOne({ userId, password }).lean();
        if (!validIAM) return res.status(500).send('userId or password invalid');

        if (!csrf1 || !csrf2 || !userId || !password) return errorGetTokenAgain(res);
        const loginRecord = await verifyTokensModel.findOne({ userId });
        if (!loginRecord || new Date(loginRecord.sessionExpiredAt).getTime() < Date.now()) {
          // case login
          const newSessionId = uuid();
          const devLoginTime = 24 * 60 * 60 * 1000;
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
                sessionExpiredAt: new Date(Date.now() + devLoginTime),
                // TODO: devLoginTime => sessionExpireTime
              },
              {
                new: true,
              },
            )
            .lean();
          if (takePlace.sessionId === newSessionId) {
            res.cookie(csrf1CookieName, takePlace.csrf1);
            res.cookie(sessionCookieName, newSessionId);
          }
          else return errorGetTokenAgain(res);
          // logger.info('sessionId: ', newSessionId);
          return okResponse(res, 'Logged in');
        }
        // logged in case: 
        extendSessionValidTime(sessionId, csrf1);
        // override __RequestVerificationToken and ASP.NET_SessionId
        res.cookie(csrf1CookieName, loginRecord.csrf1);
        res.cookie(sessionCookieName, loginRecord.sessionId)
        return okResponse(res, 'Login already');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // TODO: case session expired
  // done list subjects
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
        const sessionId = req.cookies?.[sessionCookieName];
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
  // done list subjects registered
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
        const sessionId = req.cookies?.[sessionCookieName];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        const userId = isExtendedSucceed.userId;

        const listSubjects = await studentSubjectsModel
          .find({ userId })
          .select({ _id: 0, __v: 0 })
          .lean();
        const listSubjectsSelected = await studentSelectionModel
          .find({ userId })
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
  // done select a subject
  {
    path: '/chon-mon-hoc/',
    method: 'POST',
    params: {
      $$strict: true,
      subject_code: 'number',
      to_remove: {
        type: 'boolean',
        default: false,
      },
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        const csrf1 = req.cookies?.__RequestVerificationToken;
        const sessionId = req.cookies?.[sessionCookieName];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        // TODO: should use cache
        const userId = isExtendedSucceed.userId;
        const { subject_code, to_remove } = req.body;

        // validate subject_code
        const subjectRecord = await subjectsModel.findOne({ subject_code }).lean();
        if (!subjectRecord) return errorSubjectInvalid(res);

        // select subject for student
        try {
          await studentSelectionModel.insertMany([
            {
              userId: userId,
              subject_code,
              to_remove,
            },
          ]);
        } catch (err) {
          logger.error('select failed');
        }

        return okResponse(res, 'select done');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
  // done confirm selection
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
        const sessionId = req.cookies?.[sessionCookieName];
        if (!csrf1 || !sessionId) return errorCookieInvalid(res);
        const isExtendedSucceed = await extendSessionValidTime(sessionId, csrf1);
        if (!isExtendedSucceed) return errorCookieInvalid(res);

        const userId = isExtendedSucceed.userId;
        const listSubjectsSelected = await studentSelectionModel
          .find({
            userId,
          })
          .lean();
        const selectionIds = listSubjectsSelected.map((elem) => elem._id);
        try {
          await studentSelectionModel.deleteMany({
            _id: {
              $in: selectionIds,
            },
          });
          // TODO: using cache when check valid  and check registered
          const listSubjectRegistered = await studentSubjectsModel.find({ userId }).lean();
          const confirmPromises = listSubjectsSelected.map(async (record) => {
            const subject_code = record.subject_code;
            try {
              await studentSelectionModel.deleteOne({ _id: record._id });
              const isRegistered = listSubjectRegistered.find(
                (elem) => elem.subject_code === subject_code,
              );
              if (record.to_remove && isRegistered) {
                const deletedRecord = await studentSubjectsModel.findOneAndDelete({
                  userId,
                  subject_code,
                });
                if (deletedRecord)
                  await subjectsModel.findOneAndUpdate(
                    { subject_code },
                    { $inc: { slot_left: 1 } },
                  );
              } else if (!record.to_remove && !isRegistered) {
                const isValidSubject = await subjectsModel.findOneAndUpdate(
                  {
                    subject_code,
                    slot_left: { $gt: 0 },
                  },
                  {
                    $inc: { slot_left: -1 },
                  },
                );
                if (isValidSubject)
                  await studentSubjectsModel.insertMany([
                    {
                      userId,
                      subject_code,
                    },
                  ]);
              }
            } catch (err) {
              logger.error('registered failed with subject and user: ', { userId, subject_code });
            }
          });
          await Promise.all(confirmPromises);
        } catch (err) {
          logger.error('confirm failed: ', err.message);
          return errorUnknownError(res);
        }

        return okResponse(res, 'confirmed');
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
      slot_limit: 'number|optional',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // const { subject_code, subject_name, subject_lecture, subject_schedule } = req.body;
        const subject_code: number = req.body.subject_code;
        const subject_name: string = req.body.subject_name;
        const subject_lecture: string = req.body.subject_lecture;
        const subject_schedule: string = req.body.subject_schedule;
        const slot_limit: number = req.body.slot_limit;
        try {
          await subjectsModel.insertMany([
            {
              subject_code,
              subject_name,
              subject_lecture,
              subject_schedule,
              slot_left: slot_limit,
              slot_limit,
            },
          ]);
          logger.info('insert succeed');
        } catch (err) {
          logger.warn('insert subject failed: ', err.message);
        }

        return okResponse(res, 'subject created');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err.message);
        return errorUnknownError(res);
      }
    },
  },
];
export default apis;
