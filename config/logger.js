/*
* configuration for logger.
* logger used is winston package
*/
const path = require('path');
const fs = require('fs');
const appRoot = require('app-root-path');
const clfDate = require('clf-date');

const winston = require('winston');
const config = require('./config');


// control existence of logs folder, and creates it in case of absence
var logFolder = path.resolve(`${appRoot}`, config.logging.folder);
fs.existsSync(logFolder) || fs.mkdirSync(logFolder);

// options for file logging files
const options_not_rotated = {
    infofile: {
      level: "info",
      filename: path.resolve(logFolder, "info.log"),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    },
    errorfile: {
      level: "error",
      filename: path.resolve(logFolder, "error.log"),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  };

  // prepare for daily rotating logging files
  require('winston-daily-rotate-file');
  // creation of rotation on logging files
  const infofile = new winston.transports.DailyRotateFile({
    level: "info",
    filename: path.resolve(logFolder, "application-%DATE%-info.log"),
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "100m",
    maxFiles: "14d" // keep logs for 14 days
  });
   
  infofile.on("rotate", function(oldFilename, newFilename) {
    // TODO: do something fun
  });
   
  const errorfile = new winston.transports.DailyRotateFile({
    level: "error",
    filename: path.resolve(logFolder, "application-%DATE%-error.log"),
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d" // keep logs for 30 days
  });
   
  errorfile.on("rotate", function(oldFilename, newFilename) {
    // todo: upon logfile rotation do something if needed
  });

let logger;
//creation of the logger
// TODO: implement a versatile strategy for logging which allows for selection of either file log or db logging
if (config.logging.store.db){
    //TODO: create logger in db
    console.log('ERROR: logging into db is not implemented yet')
} else{
    logger = winston.createLogger({
        transports: [
          new winston.transports.File(options_not_rotated.infofile),
          new winston.transports.File(options_not_rotated.errorfile)
        ]
      });
}

// create a stream for further connection into logger
logger.stream = {
    write: function(message, encoding){
        // select info level, so message is picked up by all
        // todo: understand the logging level in winston
        logger.info(message);
    }
}

/**
 * logs a request received by app to winston.
 * then content can be enriched to also show the body
 */
logger.combinedFormat = function(err, req, res) {
    // Similar combined format in morgan
    // :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
    return `${req.ip} - - [${clfDate(
      new Date()
    )}] \"${req.method} ${req.originalUrl} HTTP/${req.httpVersion}\" ${err.status ||
      500} - ${req.headers["user-agent"]}`;
  };

module.exports = logger;