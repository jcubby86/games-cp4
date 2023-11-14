import { ReqHandler as Handler } from '../types/express.js';

/**
 * Middleware that logs incoming http requests
 * @param req
 * @param res
 * @param next
 */
export const accessLogger: Handler = async (req, res, next) => {
  res.on('finish', () => {
    if (req.originalUrl.endsWith('/health')) return;
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${
        res.statusCode
      }`
    );
  });
  return next();
};
