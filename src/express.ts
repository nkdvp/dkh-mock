import express, { RequestHandler, Request } from 'express';
import cors from 'cors';
import Logger from './libs/logger';
import apis from './services/main';
import middlewares from './middlewares';
import { ExpressHandler, ProxyExpressHandler } from './interfaces/expressHandler';
import newValidator from './middlewares/newValidator';
import defaultRoute from './middlewares/defaultRoute';
import unhandedErrorFault from './middlewares/unhandedErrorRoute';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cookieParser from 'cookie-parser';

async function ExpressServer() {
  const logger = Logger.create('EXPRESS SERVER');
  const app = express();
  // add cookie parser
  app.use(cookieParser());
  // setup global middleware
  app.use(cors());
  app.use(...middlewares);
  // setup apis
  apis.forEach(async (api: ExpressHandler | ProxyExpressHandler) => {
    if ('proxy' in api) {
      // proxying
      logger.info('REGISTERING PROXY', api.path, api.proxy);
      const targetUrl = api.proxy;
      app.use(`${api.path}`, (req: Request, res: any, next: any) => {
        logger.info(`proxy received ${api.path}`);
        logger.info(`${req.url}`);
        return next();
      });
      app.use(
        `${api.path}`,
        createProxyMiddleware({
          target: targetUrl,
          changeOrigin: true,
          ws: true,
          pathRewrite(path) {
            return path.replace(api.path, '');
          },
        }),
      );
    } else if ('method' in api) {
      //normal api register
      const funcs: RequestHandler[] = [];
      // setup custom preValidatorMiddlewares
      if (api.preValidatorMiddlewares && api.preValidatorMiddlewares.length > 0) {
        funcs.push(...api.preValidatorMiddlewares);
      }
      // setup new validator
      if (api.params) {
        funcs.push(newValidator(api.params));
      }
      // setup custom preValidatorMiddlewares
      if (api.postValidatorMiddlewares && api.postValidatorMiddlewares.length > 0) {
        funcs.push(...api.postValidatorMiddlewares);
      }
      // add handler
      funcs.push(api.action);
      // register api
      logger.info('REGISTERING', api.method, api.path);
      switch (api.method.toLowerCase()) {
        case 'get':
          app.get(`${api.path}`, ...funcs);
          break;
        case 'post':
          app.post(`${api.path}`, ...funcs);
          break;
        case 'delete':
          app.delete(`${api.path}`, ...funcs);
          break;
        case 'put':
          app.put(`${api.path}`, ...funcs);
          break;
        case 'patch':
          app.patch(`${api.path}`, ...funcs);
          break;
        default:
          app.all(`${api.path}`, ...funcs);
          break;
      }
    }
  });
  // async system route
  app.use(defaultRoute);
  app.use(unhandedErrorFault);
  // start server
  const expressPort = process.env.HTTP_PORT || process.env.PORT || 80;
  const server = app.listen(expressPort, () => {
    logger.info('SERVER STARTED AT', expressPort);
  });
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
  process.on('SIGINT', () => {
    logger.info('SIGINT (Ctrl-C) signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}
export default ExpressServer;
