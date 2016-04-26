/* eslint-disable dot-notation */

import assert from 'assert';
import _ from 'lodash';

const env = process.env.NODE_ENV || 'development';
const validEnvs = ['development', 'test', 'production'];
const isValidEnv = _.includes(validEnvs, env);
assert(isValidEnv, `Invalid NODE_ENV "${env}".`);

const isDevMode = (env === 'development');
const isTestMode = (env === 'test');
const isProductionMode = (env === 'production');

let serverPort;
if (isDevMode) {
  serverPort = 4000;
} else if (isTestMode) {
  serverPort = 9000;
} else if (isProductionMode) {
  serverPort = 6000;
}

const configs = {};
configs['default'] = {
  db: {
    mysql: {
      database: 'plaid',
      host: 'localhost',
      port: 3306,
      user: 'plaid',
      password: 'plaid',
      connectionLimit: 200,
    },
  },
  server: {
    port: serverPort,
    isDevMode,
    isTestMode,
    isProductionMode,
  },
};

configs['production'] = {
  db: {
    mysql: {
      database: 'plaid_production',
      host: 'localhost',
      port: 3306,
    },
  },
};

configs['test'] = {
  db: {
    mysql: {
      database: 'plaid_test',
      host: 'localhost',
      port: 3306,
    },
  },
};

export default _.merge(
  {
    NODE_ENV: env,
  },
  configs['default'],
  configs[env]
);

/* eslint-enable dot-notation */
