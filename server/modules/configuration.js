const yaml = require('js-yaml');

const Logger = require('./logger');
const Utility = require('./utility');

const log = Logger.getLogger('configuration');

class Configuration {

    constructor(filename) {
        this.filename = Utility.resolveFile(filename);
        log.info(`Loading configuration from ${this.filename}`);
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