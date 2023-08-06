const { format } = require('logform');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require("../../constants/config");

const customFormat = format.combine(
    format.metadata(),
    format.timestamp(),
    format.printf(info => {
        let result = `level: ${ info.level } \ntimestamp: ${ info.timestamp } \nmessage: ${ info.message }`;
        
        for (const key in info.metadata.metadata) {
            if (Object.hasOwnProperty.call(info.metadata.metadata, key)) {
                const element = info.metadata.metadata[key];
                result += `\n${ key }: ${ element }`;                              
            }
        }

        return result += "\n";  
    })
);

const logger = winston.createLogger({
    level: 'http',
    defaultMeta: { 
        app: config.APP_NAME  
    },
    format: customFormat
});

const productionTransport = new (DailyRotateFile)({
    filename: "./logs/%DATE%.log",
    datePattern: "YYYY-MM-DD-HH", 
    format: customFormat,
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
});

logger.add(productionTransport);

if (process.env.NODE_ENV !== 'production') {
    const developmentTransport = new winston.transports.Console({
        format: customFormat,
    });

    logger.add(developmentTransport);
}

const http = function(message, metadata) {
    if(metadata) {
        logger.http(message, metadata);
    } else {
        logger.http(message);
    }
}

const info = function(message, metadata) {
    if(metadata) {
        logger.info(message, metadata);
    } else {
        logger.info(message);
    }
}

const error = function(message, metadata) {
    if(metadata) {
        logger.error(message, metadata);
    } else {
        logger.error(message);
    }
}

module.exports = {
    error,
    http,
    info
}