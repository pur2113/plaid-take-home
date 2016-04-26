import _ from 'lodash';
import winston from 'winston';

import plaid from 'plaid.config';

// Logging levels in winston conform to the severity ordering specified by
// RFC 5424 (https://tools.ietf.org/html/rfc5424).
// - emerg: 0
// - alert: 1
// - crit: 2
// - error: 3
// - warning: 4
// - notice: 5
// - info: 6
// - debug: 7

// Removes the default console transport and add with custom configs.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  colorize: true,
  level: 'debug',
  timestamp: true,
});

const logger = plaid.server.isTestMode ? _.noop : winston.log.bind(winston);

export default logger;
