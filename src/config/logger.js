import {
  createLogger,
  format as _format,
  transports as _transports,
} from 'winston';

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.errors({ stack: true }),
    _format.json()
  ),
  defaultMeta: { service: 'acquisitions-api' },
  transports: [
    new _transports.File({ filename: 'logs/error.log', level: 'error' }),
    new _transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new _transports.Console({
      format: _format.combine(_format.colorize(), _format.simple()),
    })
  );
}

export default logger;
