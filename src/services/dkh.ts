import { ExpressHandler, commonResponse, commonError } from '../interfaces/expressHandler';
import Logger from '../libs/logger';
import langs from '../constants/langs';

const logger = Logger.create('healthcheck.ts');
const apis: ExpressHandler[] = [
  {
    path: '/dang-nhap',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // TODO: return __RequestVerificationToken,
        // temporary using user-id in headers
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/chon-mon-hoc/',
    method: 'POST',
    params: {
      $$strict: true,
      subject_code: 'string',
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);

        // TODO: should use cache
        // const { subject_code } = req.body;

        // validate subject_code

        return commonResponse(res, '', '', null);

      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/danh-sach-mon-hoc/:id',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/danh-sach-mon-hoc-da-dang-ky',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
  {
    path: '/xac-nhan-dang-ky',
    method: 'POST',
    params: {
      $$strict: true,
    },
    action: async (req, res) => {
      try {
        logger.info(req.originalUrl, req.method, req.params, req.query, req.body);
        return commonResponse(res, '', '', null);
      } catch (err) {
        logger.error(req.originalUrl, req.method, 'error:', err);
        return commonError(res, err.message, langs.INTERNAL_SERVER_ERROR, null);
      }
    },
  },
];
export default apis;
