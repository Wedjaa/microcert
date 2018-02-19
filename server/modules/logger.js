const path = require('path');
const winston = require('winston');

console.log(winston.createLogger)

const Singleton = require('./singleton');
const Utility = require('./utility');

const LOGGER_ID = Symbol.for("us.torchetti.apps.microcert.logger");
const DEFAULT_SENDER = 'microcert';

let defaultConfig = {
    level: 'info',
    path: 'logs',
    filename: 'microcert.log',
    console: true,
    console_level: 'trace',
    formats: {
        splat: true,
        simple: true
    }
};

class Logger {
    
    static initialize(config) {
        if (Singleton.hasSingleton(LOGGER_ID)) {
            let singleton = Singleton.getSingleton(LOGGER_ID);
            singleton.reconfigure(config);
        } else {
            Singleton.registerSingleton(LOGGER_ID, new Logger(config));
        }
    }

    constructor(config) {
        this.config = config;
        this.loggers = {};
        this.reconfigure();
    }

    reconfigure(config) {
        const self = this;
        if (!this.config) {
            this.config = defaultConfig;
        }
        this.loggers = {};
        this.loggers.default = this.createLogger(this.config);
        if (config.loggers) {
            Object.keys(config.loggers).forEach(loggerName => {
                self.createLogger({...config.loggers[loggerName], ...self.config}, loggerName);
            });
        }
    }

    getLogger(sender) {
        if (!this.loggers[sender]) {
            this.loggers[sender] = this.createLogger(this.config, sender);
        }
        return this.loggers[sender];
    }

    createLogger(config, sender = DEFAULT_SENDER) {
        let folder = config.path;
        let filename = config.filename;
        Utility.createFolder(folder);
        let transports = [ new transports.File({
            filename: `${path.join(folder, filename)}`,
            level: config.level
        })];

        if (config.console) {
            transports.push(new transports.Console( {
                level: config.console_level
            }))
        }

        let exceptionHandlers = undefined;
        if (config.exceptions) {
            new transports.File({ filename: `${path.join(folder, config.exceptions)}` });
        }

        return createLogger({
            format: this.combineFormats(config.formats),
            transports: transports,
            exceptionHandlers: exceptionHandlers
        });

    }

    combineFormats(formats) {
        let formatsFuncs = Object.keys(formats).map(formatName => {
            let formatOpts = formats[formatName];
            let args = [];
            if (typeof formatOpts !== 'boolean') {
                args = [formatOpts];
            }
            return format[formatName].bind(this, args);
        });
        return format.combine(formatsFuncs);
    }
    
}

/**
 * Create and initialize the singleton if one 
 * doesn't exists already.
 */
if (!Singleton.hasSingleton(LOGGER_ID)) {
    Logger.initialize();
}

module.exports = Singleton.getSingleton(LOGGER_ID);



