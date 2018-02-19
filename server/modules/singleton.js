/** 
 *  Singleton pattern adapted from: 
 * 
 *  https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
 * 
 *  It is somehow outdated, but old habits die hard.
 */

class Singleton {
    
    static hasSingleton(id) {
        var globalVariables = Object.getOwnPropertySymbols(global);
        return (globalVariables.indexOf(id) > -1);
    }

    static registerSingleton(id, object) {
        Object.freeze(object);
        global[id] = object;
    }

    static getSingleton(id) {
        if (this.hasSingleton(id)) {
            return global[id];
        }
        throw new Error(`${id}: the singleton does not exist!`);
    }
}

module.exports = Singleton;