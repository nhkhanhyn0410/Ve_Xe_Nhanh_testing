const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Enhanced logger utility with colored console output
 * For production, consider using Winston or Pino
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, process.env.LOG_FILE || 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

const timestamp = () =>
  new Date().toLocaleString('en-GB', { hour12: false });

// Độ rộng tối đa cho label (SUCCESS = 7)
const LABEL_WIDTH = 7;

const format = (label, labelColor, textColor, message) => {
  const paddedLabel = label.padEnd(LABEL_WIDTH, ' '); // căn đều
  console.log(
    chalk.gray(`[${timestamp()}]`) +
    '  ' +
    labelColor(paddedLabel) +
    '  ' +
    textColor(message)
  );
};

/**
 * Format log message for file writing
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLog = (level, message, meta = {}) => {
  const ts = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
};

/**
 * Write log to file
 * @param {string} file - Log file path
 * @param {string} message - Log message
 */
const writeLog = (file, message) => {
  fs.appendFile(file, message, (err) => {
    if (err) {
      // Use the new logger format for internal errors
      format('ERROR', chalk.red, chalk.redBright, 'Error writing to log file: ' + err.message);
    }
  });
};

/**
 * Logger object with colored console output
 */
const logger = {
  info: (msg, meta = {}) => {
    format('INFO', chalk.blue, chalk.cyan, msg);
    if (process.env.NODE_ENV !== 'test') {
      writeLog(logFile, formatLog('log', msg, meta));
    }
  },

  success: (msg, meta = {}) => {
    format('SUCCESS', chalk.green, chalk.greenBright, msg);
    if (process.env.NODE_ENV !== 'test') {
      writeLog(logFile, formatLog('success', msg, meta));
    }
  },

  warn: (msg, meta = {}) => {
    format('WARN', chalk.yellow, chalk.yellowBright, msg);
    if (process.env.NODE_ENV !== 'test') {
      writeLog(logFile, formatLog('warn', msg, meta));
    }
  },

  error: (msg, meta = {}) => {
    format('ERROR', chalk.red, chalk.redBright, msg);
    if (process.env.NODE_ENV !== 'test') {
      writeLog(errorLogFile, formatLog('error', msg, meta));
      writeLog(logFile, formatLog('error', msg, meta));
    }
  },

  debug: (msg, meta = {}) => {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      format('DEBUG', chalk.magenta, chalk.magentaBright, msg);
      if (process.env.NODE_ENV !== 'test') {
        writeLog(logFile, formatLog('debug', msg, meta));
      }
    }
  },

  start: (msg, meta = {}) => {
    format('START', chalk.hex('#9d4edd'), chalk.hex('#9d4edd'), msg);
    if (process.env.NODE_ENV !== 'test') {
      writeLog(logFile, formatLog('start', msg, meta));
    }
  },
};

module.exports = logger;
