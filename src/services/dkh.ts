import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import subjectsModel from '../models/subjects.model';
import studentSubjectsModel from '../models/studentSubject.model';
import studentSelectionModel from '../models/studentSelection.model';
import verifyTokensModel from '../models/verifyToken.model';
import { v4 as uuid } from 'uuid';
import { sessionExpireTime } from '../constants/iam';
import { extendSessionValidTime } from '../libs/iam';

const logger = Logger.create('healthcheck.ts');
const apis: ExpressHandler[] = [
  // doing login
  {
    path: '/dang-nhap',
    method: 'GET',
    params: {
      // $$strict: true,
      // username: 'string',
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
        if (tokenRecord.returnAt.getTime() !== present.getTime())
          return res.status(500).send('Get token again');

        res.cookie('__RequestVerificationToken', tokenRecord.csrf1);
        res.cookie('__RequestVerificationToken2', tokenRecord.csrf2);
        logger.info('token record: ', tokenRecord);

        return res.status(200).send('Get cookie done');
        // TODO: return __RequestVerificationToken,
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  // doing login
  {
    path: '/dang-nhap',
    method: 'POST',
    params: {
      // $$strict: true,
      // username: 'string',
      // password: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // logger.info('cookie: ', req.cookies);
        // logger.info('headers:', req.headers);
        // logger.info('body: ', req.body);
        const CSRF1 = req.cookies?.__RequestVerificationToken;
        const CSRF2 = req.body?.__RequestVerificationToken;
        const username = req.body?.LoginName;
        const password = req.body?.Password;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];

        // TODO: check username/password in user collection

        if (!CSRF1 || !CSRF2 || !username || !password)
          return res.status(500).send('Something broke!');
        if (sessionId) return res.status(200).send('Login already');
        const newSessionId = uuid();

        const takePlace = await verifyTokensModel
          .findOneAndUpdate(
            {
              csrf1: CSRF1,
              csrf2: CSRF2,
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
              username,
              sessionId,
              sessionExpiredAt: new Date(Date.now() + sessionExpireTime),
            },
            {
              new: true,
            },
          )
          .lean();
        if (takePlace.sessionId === sessionId) res.cookie('ASP.NET_SessionId', newSessionId);
        else return res.status(500).send('Get token again');
        // logger.info('sessionId: ', newSessionId);
        return res.status(200).send('Logged in');
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
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
        if (!csrf1 || !sessionId) res.status(500).send('Login again');
        extendSessionValidTime(sessionId, csrf1);

        const listSubjects = await subjectsModel.find().select({ _id: 0, __v: 0 }).lean();

        return commonResponse(res, '', '', listSubjects);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
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
        if (!csrf1 || !sessionId) res.status(500).send('Login again');
        extendSessionValidTime(sessionId, csrf1);

        const listSubjects = await studentSubjectsModel.find().select({ _id: 0, __v: 0 }).lean();
        const listSubjectsSelected = await studentSelectionModel
          .find()
          .select({ _id: 0, __v: 0 })
          .lean();

        return commonResponse(res, '', '', { listSubjects, listSubjectsSelected });
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
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
        if (!csrf1 || !sessionId) res.status(500).send('Login again');
        extendSessionValidTime(sessionId, csrf1);

        // TODO: should use cache
        const { userid } = req.headers;
        const { subject_code } = req.body;

        // validate subject_code
        // select subject for student
        try {
          await studentSelectionModel.insertMany([
            {
              student_id: userid,
              subject_code,
            },
          ]);
        } catch (err) {
          logger.error('register');
        }

        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
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
        if (!csrf1 || !sessionId) res.status(500).send('Login again');
        extendSessionValidTime(sessionId, csrf1);

        const { userid } = req.headers;
        const listSubjectsSelected = await studentSelectionModel
          .find({
            student_id: userid,
          })
          .lean();
        const updateArray = listSubjectsSelected.map((elem) => ({
          student_id: elem.student_id,
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
        }

        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
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
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
];
export default apis;
