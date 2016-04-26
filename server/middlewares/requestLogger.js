import logger from 'server/logger';

export default function requestLogger(req, res, next) {
  logger('info', `${req.method} ${req.url}`);
  next();
}
