import { Response } from 'express';

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
const errorSubjectInvalid = (res: Response) => {
  return res.status(500).send('Subject invalid');
};

export {
  errorCookieInvalid,
  errorGetTokenAgain,
  errorUnknownError,
  okResponse,
  errorSubjectInvalid,
};
