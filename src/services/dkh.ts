import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import subjectsModel from '../models/subjects.model';
import studentSubjectsModel from '../models/studentSubject.model';
import studentSelectionModel from '../models/studentSelection.model';
import { v4 as uuid } from 'uuid';

const logger = Logger.create('healthcheck.ts');
const apis: ExpressHandler[] = [
  // doing login
  {
    path: '/',
    method: 'POST',
    params: {
      // $$strict: true,
      // username: 'string',
      // password: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // const tokenRecord = 

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

        logger.info('cookie: ', req.cookies);
        logger.info('headers:', req.headers);
        logger.info('body: ', req.body);
        const CSRF1 = req.cookies?.__RequestVerificationToken;
        const CSRF2 = req.body?.__RequestVerificationToken;
        const username = req.body?.LoginName;
        const password = req.body?.Password;
        const sessionId = req.cookies?.['ASP.NET_SessionId'];

        // logger.info('get headers done');
        if (!CSRF1 || !CSRF2 || !username || !password) return res.status(500).send('Something broke!');
        if (sessionId) return res.status(200).send('Login already');
        // logger.info('bruhh');
        const newSessionId = uuid();
        // logger.info('sessionId: ', newSessionId);
        res.cookie('ASP.NET_SessionId', newSessionId);
        // logger.info('sessionId: ', newSessionId);
        return res.status(200).send('Login done');
        // TODO: return __RequestVerificationToken,
        // temporary using user-id in headers
        return commonResponse(res, '', '', null);
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
