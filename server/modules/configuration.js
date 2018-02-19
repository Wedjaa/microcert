const yaml = require('js-yaml');

const Logger = require('./logger');
const Utility = require('./utility');

const ENV_ROOT = 'MICROCA_';

const log = Logger.getLogger('configuration');

class Configuration {

    constructor(filename) {
        log.debug(`Logging Constructor Setup`);
        let envConfig = Configuration.parseEnv();
        //this.filename = Utility.resolveFile(filename);
        //log.info(`Loading configuration from ${this.filename}`);
    }

    static parseEnv() {
        let envOptions = Object.keys(process.env)
            .filter(key => key.indexOf(ENV_ROOT) === 0)
            .reduce( (conf, key) => {
                log.debug(`Processing: ${key}`);
                let path = key.split('_');
                log.debug(`Path: `, path);
                return conf;
            }, {});
        log.debug(`Parsed from ENV: ${JSON.stringify(envOptions)}`);        

    }

    async load() {
        try {
            var doc = yaml.safeLoad(fs.readFileSync('/home/ixti/example.yml', 'utf8'));
            console.log(doc);
          } catch (e) {
            console.log(e);
          }
        return Promise.resolve();
    }
}

module.exports = Configuration;