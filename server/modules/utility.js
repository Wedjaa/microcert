const path = require('path');
const fs = require('fs');

class Utility {

    static resolveFolder(folder) {
        if (path.isAbsolute(folder)) {
            return folder;
        }

        return path.normalize(path.join(__dirname, '..', '..', folder));
    }

    static resolveFile(filename) {

        if (path.isAbsolute(filename)) {
            return filename;
        }

        let folder = Utility.resolveFolder(path.folder(filename));
        filename = path.filename(filename);
        return path.normalize(path.join(folder, filename));
    }

    static createFolder(folder) {
        let initialFolder = path.isAbsolute(folder) ? path.sep : '';
        folder
            .split(path.sep)
            .reduce((parent, child) => {
                let target = path.resolve(parent, child);
                try {
                    fs.mkdirSync(target);
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        throw err;
                    }
                }
                return target;
            }, initialFolder);
    }

}

module.exports = Utility;