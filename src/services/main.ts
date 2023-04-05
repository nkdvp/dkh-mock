import { ExpressHandler, ProxyExpressHandler } from '../interfaces/expressHandler';
import healthCheckApis from './healthcheck';
import demoProxy from './proxy/demo'
import dkhApis from './dkh'
import usersApis from './users'

const apis: (ExpressHandler | ProxyExpressHandler)[] = [
  ...healthCheckApis,
  ...demoProxy,
  ...dkhApis,
  ...usersApis
];
export default apis;
