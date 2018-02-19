const path = require('path');

const { createLogger, format, transports} = require('winston');

const Singleton = require('./singleton');
const Utility = require('./utility');

const LOGGER_ID = Symbol.for("us.torchetti.apps.microcert.logger");
const DEFAULT_SENDER = 'microcert';

let defaultConfig = {
    level: 'info',
    path: 'logs',
    filename: 'microcert.log',
    format: '[${timestamp}] [${level}] ${logger} - ${message} ${rest}', 
    console: true,
    console_level: 'silly',
    formats: {
        colorize: true,
        timestamp: true
    }
};

function formatted(format, info) {
    let formatRe = /\$\{([^\}]+)\}/g;
    let match = formatRe.exec(format);
    while (match) {
        let propName = match[1];
        if (info[propName]) {
            format = format.replace(new RegExp(`\\$\\{${propName}\\}`, 'g'), info[propName]);
            delete info[propName];
        }
        if (propName === 'rest') {
            let restValue = '';
            if (Object.keys(info).length) {
                restValue = JSON.stringify(info);
            }
            format = format.replace(new RegExp(`\\$\\{${propName}\\}`, 'g'), restValue);
        }
        /**
         * This will force the RegExp to start from the beginning
         * every time.
         */
        formatRe.lastIndex = 0;
        match = formatRe.exec(format);
    }
    return format;
}

function formatter(msgFormat, logger) {
    return format.printf( info => {
        info.logger = logger;
        return formatted(msgFormat, info);
    });
}

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
        
        config = config ? config : this.config;

        if (!config) {
            config = defaultConfig;
        }

        this.config = config;
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
        let logTransports = [ new transports.File({
            filename: `${path.join(folder, filename)}`,
            level: config.level
        })];

        if (config.console) {
            logTransports.push(new transports.Console( {
                level: config.console_level
            }))
        }

        let exceptionHandlers = undefined;
        if (config.exceptions) {
            exceptionHandlers = new transports.File({ filename: `${path.join(folder, config.exceptions)}` });
        }

        return createLogger({
            format: this.combineFormats(config.formats, config.format, sender),
            transports: logTransports,
            exceptionHandlers: exceptionHandlers
        });

    }

    combineFormats(formats, msgFormat, sender) {
        let formatsFuncs = Object.keys(formats).map(formatName => {
            let formatOpts = formats[formatName];
            let opts = {};
            if (typeof formatOpts !== 'boolean') {
                opts = formatOpts;
            }
            return format[formatName](opts);
        });
        formatsFuncs.push(formatter(msgFormat, sender));
        return format.combine.apply(format, formatsFuncs);
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



