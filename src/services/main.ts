import { ExpressHandler, ProxyExpressHandler } from '../interfaces/expressHandler';
import healthCheckApis from './healthcheck';
import demoProxy from './proxy/demo'
import dkhApis from './dkh'

const apis: (ExpressHandler | ProxyExpressHandler)[] = [
  ...healthCheckApis,
  ...demoProxy,
  ...dkhApis,
];
export default apis;
