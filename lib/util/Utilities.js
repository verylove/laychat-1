var Utilities = require('util');

module.exports = exports = Utilities;

/**
 * 
 * @param target
 *            {Object}
 * @returns
 */
Utilities.extend = global.extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for( var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
};

Utilities.isString = global.isString = function(str) {
    return 'string' === typeof str ? true : false;
};
Utilities.isNumber = global.isNumber = function(num) {
    return 'number' === typeof num ? true : false;
};
Utilities.isBoolean = global.isBoolean = function(bool) {
    return 'boolean' === typeof bool ? true : false;
};
Utilities.isObject = global.isObject = function(obj) {
    return 'object' === typeof obj ? true : false;
};
Utilities.isPureObject = function(o) {
    return o !== undefined && o !== null && !Utilities.isFunction(o)
            && !Utilities.isString(o) && !Utilities.isNumber(o)
            && !Utilities.isBoolean(o) && !Utilities.isArray(o)
            && !Utilities.isDate(o) && !Utilities.isRegExp(o)
            && !Utilities.isError(o);
};
Utilities.isInteger = global.isInteger = function(int) {

};
Utilities.isFloat = global.isFloat = function(float) {

};
Utilities.isBinary = global.isBinary = function(bin) {

};
Utilities.isFunction = global.isFunction = function(f) {
    return 'function' === typeof obj ? true : false;
};
Utilities.isNull = global.isNull = function(n) {
    return n === null ? true : false;
};
Utilities.isEmpty = global.isEmpty = function(o) {
    if(o === undefined || o === null)
        return true;
    if(Utilities.isArray(o) && o.length === 0)
        return true;
    if(Utilities.isString(o) && o.length === 0)
        return true;
    if(Utilities.isPureObject(o) && Object.keys(o).length === 0)
        return true;
    return false;
};