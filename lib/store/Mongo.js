var Utilities = require('../util/Utilities');
var Store = require('../store/Store');
var mongodb = require('mongodb');
var MongoDB = mongodb.Db;
var Server = mongodb.Server;
var assert = require('assert');

function Mongo(model, config) {
    this.model = model;
    this.config = config;
    this.link = null;
    this.result = null;

    this.init();
}

Utilities.inherits(Mongo, Store);

module.exports = exports = Mongo;

/**
 * @api private
 */
Mongo.prototype.init = function() {
    var config = this.config;
    this.link = new MongoDB(config.database, new Server(config.host, config.port), { safe : false });
    // always connect lazily
};
/**
 * 连接后可重新选择数据库
 * 
 * @param database
 * @sync
 */
Mongo.prototype.choose = function(database, fn) {
    if(!Utilities.isString(database)) {
        database = config.database;
    }
    // 先关闭
    if(!Utilities.isEmpty(this.link) && this.link.state === 'connected') {
        this.link.close();
    }

    this.link = new MongoDB(database, new Server(config.host, config.port), { safe : false });

    if(Utilities.isFunction(fn)) {
        fn();
    }
};
/**
 * 连接后可重新选择数据库
 * 
 * @param database
 * @sync
 */
Mongo.prototype.change = function(config, fn) {
    if(Utilities.isFunction(config) && Utilities.isObject(this._config)){
        this.config = this._config;
        fn = config;
    } else if(Utilities.isObject(config)) {
        this._config = this.config;
        this.config = config;
    } else {
        return false;
    }
    
    var config = this.config;
    
    // 先关闭
    if(!Utilities.isEmpty(this.link) && this.link.state === 'connected') {
        this.link.close();
    }

    this.link = new MongoDB(database, new Server(config.host, config.port), { safe : false });

    if(Utilities.isFunction(fn)) {
        fn();
    }
};
/**
 * 
 * @param database
 * @param fn
 * @sync
 */
Mongo.prototype.close = function(fn) {
    // 关闭
    if(!Utilities.isEmpty(this.link) && this.link.state === 'connected') {
        this.link.close();
    }

    if(Utilities.isFunction(fn)) {
        fn();
    }
};
/**
 * @api private
 */
Mongo.prototype.connect = function(fn) {
    var config = this.config;
    var link = this.link;
    if(link.state === 'disconnected') {
        link.open(function(err) {
            assert.equal(null, err);
            if(config.username && config.password) {
                link.authenticate(config.username, config.password, function(err, res) {
                    assert.equal(null, err);
                    if(Utilities.isFunction(fn)) {
                        fn();
                    }
                });
            } else {
                if(Utilities.isFunction(fn)) {
                    fn();
                }
            }
        });
    } else {
        if(Utilities.isFunction(fn)) {
            fn();
        }
    }
};
Mongo.prototype.insert = function(docs, opts, fn) {
    var me = this;
    var link = this.link;
    var table = this.model.table();
    var args = Array.prototype.slice.call(arguments, 0);
    fn = args.pop();
    docs = args.length ? args.shift() || {} : {};
    opts = args.length ? args.shift() || {} : {};

    this.connect(function() {
        link.collection(table).insert(docs, opts, function(err, result) {
            assert.equal(null, err);
            me.result = result;
            fn(result);
        });
    });
};
Mongo.prototype.update = function(selector, docs, opts, fn) {
    var me = this;
    var link = this.link;
    var table = this.model.table();
    var args = Array.prototype.slice.call(arguments, 0);
    fn = args.pop();
    selector = args.length ? args.shift() || {} : {};
    docs = args.length ? args.shift() || {} : {};
    opts = args.length ? args.shift() || {} : {};

    this.connect(function() {
        link.collection(table).update(selector, docs, opts, function(err, result) {
            assert.equal(null, err);
            me.result = result;
            fn(result);
        });
    });
};
/**
 * delete是关键字，所以使用remove，让eclipse不报错
 */
Mongo.prototype.remove = function(selector, opts, fn) {
    var me = this;
    var link = this.link;
    var table = this.model.table();
    var args = Array.prototype.slice.call(arguments, 0);
    fn = args.pop();
    selector = args.length ? args.shift() || {} : {};
    opts = args.length ? args.shift() || {} : {};
    this.connect(function() {
        link.collection(table).remove(selector, opts, function(err, result) {
            assert.equal(null, err);
            me.result = result;
            fn(result);
        });
    });
};
Mongo.prototype.select = function(selector, fields, opts, fn) {
    var me = this;
    var link = this.link;
    var table = this.model.table();
    var args = Array.prototype.slice.call(arguments, 0);
    fn = args.pop();
    selector = args.length ? args.shift() || {} : {};
    fields = args.length ? args.shift() || [] : [];
    opts = args.length ? args.shift() || {} : {};

    this.connect(function() {
        link.collection(table).find(selector, fields, opts).toArray(function(err, result) {
            assert.equal(null, err);
            me.result = result;
            fn(result);
        });
    });
};
Mongo.prototype.count = function(selector, opts, fn) {
    var me = this;
    var link = this.link;
    var table = this.model.table();
    var args = Array.prototype.slice.call(arguments, 0);
    fn = args.pop();
    selector = args.length ? args.shift() || {} : {};
    opts = args.length ? args.shift() || {} : {};

    this.connect(function() {
        link.collection(table).count(selector, opts, function(err, result) {
            assert.equal(null, err);
            me.result = result;
            fn(result);
        });
    });
};