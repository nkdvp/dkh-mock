import express from 'express';
import authentication from './authentication';
import authorization from './authorization';
import errorHandler from './jsonMalformedErrorRoute';

export default [
  express.json({ limit: '50mb' }),
  express.urlencoded({ extended: true, limit: '50mb' }),
  errorHandler,
  authentication,
  authorization,
];
