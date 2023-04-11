import { Response } from 'express';

const errorCookieInvalid = (res: Response) => {
  return res.status(500).send('Cookie invalid');
};
const errorSessionExpired = (res: Response) => {
  return res.status(500).send('Session expired');
};
const errorGetTokenAgain = (res: Response) => {
  return res.status(500).send('Get token again');
};
const errorUnknownError = (res: Response, message = 'Something is broken') => {
  return res.status(500).send(message);
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
  errorSessionExpired,
  errorGetTokenAgain,
  errorUnknownError,
  okResponse,
  errorSubjectInvalid,
};
