import { Request, Response, NextFunction } from 'express';
import Logger from '../libs/logger';
import langs from '../constants/langs';
import { defaultValidator } from '../libs/defaultValidator';

const logger = Logger.create('newValidator');
const v = defaultValidator();
const newValidator = (validateSchema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const check = v.compile(validateSchema);
    const match = check(req.body);
    logger.info('Param validated');
    if (match !== true) {
      return res.status(400).json({
        success: false,
        message: 'Validator Error',
        code: langs.VALIDATOR_ERROR,
        data: match,
      });
    }
    return next();
  } catch (e) {
    logger.error('newValidator Error', e.message);
    return res.status(400).json({
      success: false,
      message: 'Validator Error',
      code: langs.VALIDATOR_ERROR,
      data: e.message,
    });
  }
};
export default newValidator;
