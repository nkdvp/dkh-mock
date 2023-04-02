import axios from 'axios';
import { VerifyToken } from '../interfaces/verifyTokens';
import { getTokenFromHtml } from '../libs/domHTML';
import Logger from '../libs/logger';
import cookieParser from 'cookie-parser';
import verifyTokensModel from '../models/verifyToken.model';

const logger = Logger.create('DKH_TOKEN_JOB');

const axiosInstance = axios.create({
  withCredentials: true,
});

const parseCookieStringToObj = (cookieStrings: string[]) => {
  const cookieObj: any = {};
  cookieStrings.forEach((rawRequestToken) => {
    const str = rawRequestToken.split(';');
    str.forEach((strElem) => {
      const cur = strElem.split('=');
      cookieObj[(cur[0] || '').trim()] = (cur[1] || '').trim();
    });
  });
  return cookieObj;
};

// get token from dkh-real
const getTokens = async () => {
  const urlGetCookie = process.env.URL_DKH;
  logger.info(urlGetCookie);
  const result = await axiosInstance.get(urlGetCookie);

  // parse cookie string[] to obj and get token csrf1
  const cookie = parseCookieStringToObj(result.headers['set-cookie']);
  const csrf1 = cookie?.__RequestVerificationToken;

  // get html page and get token csrf2
  const htmlDoc = result.data;
  const csrf2 = getTokenFromHtml(htmlDoc);

  const returnObj = { csrf1, csrf2 };
  logger.info('get token: ', returnObj);
  return returnObj
};

const jobGetTokens = async () => {
  const tokenObj = await getTokens();
  const body: VerifyToken = { 
    ...tokenObj,
    createdAt: new Date(),
    returnAt: new Date(),
  }
  verifyTokensModel.insertMany([body]);

  setTimeout( () => jobGetTokens(), 1000);
};

const updateReturnField = async () => {
  const count = await verifyTokensModel.count();
  const numRecord = 10;
  let idx = 0;
  while (idx < count) {
    // eslint-disable-next-line no-await-in-loop
    const records = await verifyTokensModel
      .find()
      .sort({_id: 1})
      .limit(numRecord)
      .skip(idx)
      .lean();
    const promiseFixRecords = records.map(async (record) => {
      await verifyTokensModel.updateOne({
        _id: record._id,
      }, {
        returnAt: new Date(record.createdAt),
      });
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promiseFixRecords);

    const ids = records.map((record) => record._id.toString());
    logger.info('update returnAt of: ', ids);
    idx += numRecord;
  }
}



export { getTokens, parseCookieStringToObj, jobGetTokens, updateReturnField };
