// eslint-disable-next-line max-classes-per-file
import winston, {
  format, Logger, transports, Logform,
} from 'winston';
import { SPLAT } from 'triple-beam';
import lodashPkg from 'lodash';
import chalk from 'chalk';
import stringify from 'json-stringify-safe';
import Transport from 'winston-transport';
import { EventEmitter } from 'events';
import apm from 'elastic-apm-node';

EventEmitter.setMaxListeners(30);
const { isObject, trimEnd } = lodashPkg;

const customLevelIncident: string[] = ['\u001b[31mERROR\u001b[39m', '\u001b[32mINFO\u001b[39m'];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CustomTransport extends Transport {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
  }

  // eslint-disable-next-line class-methods-use-this
  log(
    info: any,
    callback: any,
  ) {
    // console.log(info);
    // Incident handler
    if (customLevelIncident.includes(info.level)) {
      // console.log('Incident', info);
      // form incident object
      // send
    }
    callback();
  }
}

// Using transport
const customTransport = new CustomTransport({});

const {
  combine, colorize, label, printf, align, errors, timestamp,
} = format;

function formatObject(param: any) {
  if (param && param.stack) {
    if (param.ctx && param.type) {
      return stringify({
        code: param.code, type: param.type, data: param.data,
      }, null, 2);
    }
    return stringify(param);
  }
  if (isObject(param)) {
    return stringify(param, null, 2);
  }
  return param;
}

const all = (serviceName: string) => format((info: any, opts: any) => {
  const splat = info[SPLAT] || [];

  const isSplatTypeMessage = typeof info.message === 'string'
    && (info.message.includes('%s') || info.message.includes('%d') || info.message.includes('%j'));
  if (isSplatTypeMessage) {
    return info;
  }
  let message = formatObject(info.message);
  const rest = splat
    .map(formatObject)
    .join(' ');
  message = trimEnd(`${message} ${rest}`);
  return {
    ...info, message, logger: info.label, 'service.name': opts.serviceName, '@timestamp': new Date(), ...apm.currentTraceIds,
  };
})({ serviceName });

const printJSON = (info: Logform.TransformableInfo) => stringify(info);
const printLine = (
  info: Logform.TransformableInfo,
) => `[${info.timestamp}] ${info.level}  ${chalk.blue(info.label.toUpperCase())}: ${info.message} ${info.stack ? (`\n${info.stack}`) : ''}`;

const incidentFilter = format((info) => {
  if (info.private) { return false; }
  // console.log('incidentFilter', info);
  return info;
});
const customLevels = {
  levels: {
    incident: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    incident: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'green',
    verbose: 'blue',
    debug: 'blue',
    silly: 'white',
  },
};
colorize().addColors(customLevels.colors);
export default class WinstonLogger {
  static create(logger: string, serviceName = process.env.npm_package_name) {
    const env = process.env.LOGGING_PROFILE || 'default';
    const level = process.env.LOG_LEVEL || 'info';
    const customLogger = (env !== 'default')
      ? winston.createLogger({
        format: combine(
          incidentFilter(),
          errors({ stack: true }),
          format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
          all(serviceName),
          label({ label: logger }),
          align(),
          // timestamp(),
          printf(printJSON),
        ),
        levels: customLevels.levels,
        level,
        transports: [new transports.Console(), customTransport],
      })
      : winston.createLogger({
        format: combine(
          incidentFilter(),
          errors({ stack: true }),
          format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
          colorize(),
          all(serviceName),
          label({ label: logger }),
          align(),
          timestamp(),
          printf(printLine),
        ),
        levels: customLevels.levels,
        level,
        transports: [new transports.Console(), customTransport],
      });
    return customLogger as Logger & Record<keyof typeof customLevels['levels'], winston.LeveledLogMethod>;
  }
}
