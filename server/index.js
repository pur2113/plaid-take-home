import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';

import plaidConfig from 'plaid.config';
import logger from 'server/logger';
import requestLogger from 'server/middlewares/requestLogger';
import routes from 'server/routes';

// Make sure the uncaughtException and unhandledRejection are logged.
const errorHandler = context => err => {
  logger('error', `${context}:`, err);
};
process.on('uncaughtException', errorHandler('uncaughtException'));
process.on('unhandledRejection', errorHandler('unhandledRejection'));

function initServer(server) {
  logger('info', 'Initializing the server.');
  // ************************************************
  // NOTE: Ordering of the middlewares are important!
  // ************************************************
  server.use(compression());
  server.use(requestLogger);
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use('/', routes);
}

function runServer(server) {
  logger('info', 'The server configuration:\n', JSON.stringify(plaidConfig, null, 2), {});
  logger('info', `The server is listening on port ${plaidConfig.server.port}.`);
  server.listen(plaidConfig.server.port);
}

const server = express();
initServer(server);
runServer(server);

export default server;
