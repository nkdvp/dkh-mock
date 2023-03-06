import {
  ProxyExpressHandler,
} from '../../interfaces/expressHandler';

const apis: ProxyExpressHandler[] = [
  {
    path: '/proxy/demo',
    proxy: 'http://localhost:8080',
  },
];
export default apis;
