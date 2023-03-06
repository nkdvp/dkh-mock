import { ExpressHandler, ProxyExpressHandler } from '../interfaces/expressHandler';
import healthCheckApis from './healthcheck';
import demoProxy from './proxy/demo'
const apis: (ExpressHandler | ProxyExpressHandler)[] = [
  ...healthCheckApis,
  ...demoProxy
];
export default apis;
