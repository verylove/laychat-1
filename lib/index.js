var path = require('path');
var express = require('express');
//var logger = require('express-logger');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var methodOverride = require('method-override');
var fs = require('fs');
var url = require('url');
var useragent = require('useragent');
var assert = require('assert');

//几个优先加载项
var Underscore = $.util.Underscore;
var Utilities = $.util.Utilities;
var Logger = $.util.Logger;

var Config = $.core.Config;
var Async = $.util.Async;

var Pool = $.core.Pool;
var Action = $.core.Action;
var Manager = $.core.Manager;
var ChannelManager = $.manager.ChannelManager;

function Laychat() {
}

module.exports = exports = Laychat;

Laychat.open = function(app, io) {
    app.set('views', __dirname + '/../template');
    app.set('view engine', 'jade');
    app.use("/css", express.static(__dirname + '/../static/css'));
    app.use("/library", express.static(__dirname + '/../static/library'));
    app.use("/jquery", express.static(__dirname + '/../static/jquery'));
    app.use("/webix", express.static(__dirname + '/../static/webix'));
    app.use("/js", express.static(__dirname + '/../static/js'));
    app.use("/image", express.static(__dirname + '/../static/image'));
    app.use("/html", express.static(__dirname + '/../static/html'));
    app.use("/favicon.ico", express.static(__dirname + '/../static/image/favicon.ico'));
    app.use("/image/favicon.ico", express.static(__dirname + '/../static/image/favicon.ico'));

    app.use(express.static(__dirname + '/../static'));
    /*
    app.use(express.use({stream: fs.createWriteStream(__dirname + '/../logs/express.log', {flags: 'a'})}));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.cookieSession({ secret:'laychat',cookie: { maxAge: 60 * 60 * 1000 }}));
    */
    
    //app.use(logger({path: __dirname + '/../logs/express.log'}));
    app.use(bodyParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(methodOverride());
    app.use(cookieSession({ secret:'laychat',cookie: { maxAge: 60 * 60 * 1000 }}));
    
    /*var nodeVersion = process.versions.node.split('.');
    $logger.info(parseInt(nodeVersion[0], 10) === 0 && parseInt(nodeVersion[1], 10) < 10);*/
    /*
    // development only
    app.configure('development', function(){
        app.set('db uri', 'localhost/dev');
    });

    // production only
    app.configure('production', function(){
        app.set('db uri', 'n.n.n.n/prod');
    });
    */

    $logger.info('This process is pid ' + process.pid);
    Laychat.openConfig(app, io);
    Laychat.openUser(app, io);//
    Laychat.openChannel(app, io);//
    Laychat.openPool(app, io);
    Laychat.openAction(app, io);
    Laychat.open404(app, io);
};
/**
 * 
 * @param app
 * @param io
 */
Laychat.openConfig = function(app, io) {
    $config.configure(function() {
        $config.configure({
            'file': __dirname + '/../config/env.json'
        });
        $config.configure({
            'dir': __dirname + '/../config/common'
        });
        $config.configure({
            'file': __dirname + '/../config/main.' + $config.get('env') + '.json',
            'dir': __dirname + '/../config/' + $config.get('env')
        });
        //$logger.info('configuration', $util.json($config.get()));
    });
};

Laychat.openUser = function(app, io) {
    Manager.factory('UserManager', io).open();
};
/**
 * 
 */
Laychat.openChannel = function(app, io, channelid) {
    channelid = channelid || 10000;
    //Manager.factory('ChannelManager', io).open();
    ChannelManager.factory(io, channelid).open();
};
Laychat.open404 = function(app, io) {
    app.get('*', function(req, res, next){
        // trigger a 404 since no other middleware
        // will match /404 after this one, and we're not
        // responding here
        res.statusCode = 404;
        res.sendfile(path.resolve(__dirname, '../static/html/', '404.html'));
    });
};
Laychat.openAction = function(app, io) {
    var lifecycle = function(action) {
        action.on('create', action.onCreate)
            .on('start', action.onStart)
            .on('get', action.onGet)
            .on('post', action.onPost)
            .on('request', action.onRequest)
            .on('stop', action.onStop)
            .on('destroy', function() {
                action.onDestroy();
                delete action;
            }).emit('create');
    };
    app.use(function(req, res, next) {
        $logger.info('This process is pid:' + process.pid);
        //var originalUrl = url.parse(req.originalUrl);
        var parsed = url.parse(req.url);
        if (parsed.auth && !parsed.protocol && ~parsed.href.indexOf('//')) {
            // This parses pathnames, and a strange pathname like //r@e should work
            parsed = url.parse(req.url.replace(/@/g, '%40'));
        }
        var path = parsed.pathname;
        var gets = $config.get('actions.get');
        var posts = $config.get('actions.post');
        var requests = $config.get('actions.request');
        var regexps = $config.get('actions.regexp');

        if ('GET' === req.method) {
            if($util.isString(gets[path])) {
                lifecycle(Action.instance(gets[path], req, res));
                return true;
            } else if($util.isString(requests[path])) {
                lifecycle(Action.instance(requests[path], req, res));
                return true;
            }
        } else if('POST' === req.method) {
            if($util.isString(posts[path])) {
                lifecycle(Action.instance(posts[path], req, res));
                return true;
            } else if($util.isString(requests[path])) {
                lifecycle(Action.instance(requests[path], req, res));
                return true;
            }
        }
        if($util.isArray(regexps)) {
            for(var i in regexps) {
                var regexp = regexps[i];
                var reg = new RegExp(regexp.reg);
                var ref = regexp.ref;
                var matchs = reg.exec(path);
                if(matchs) {
                    $logger.error(reg, ref);
                    var params = req.params = [];
                    for (var i = 1, len = matchs.length; i < len; ++i) {
                        params.push($util.isString(matchs[i]) ? decodeURIComponent(matchs[i]) : matchs[i]);
                    }
                    lifecycle(Action.instance(ref, req, res));
                    return true;
                }
            }
        }
        
        next();
    });
};
Laychat.openPool = function(app, io, opts) {
    Pool.factory('pool.cache.SocketUserPool').open(function() {
        $logger.info('SocketUser pool is ready');
    });
    Pool.factory('pool.memcache.MessagePool').open(function() {
        $logger.info('Message pool is ready');
    });
    /*Pool.factory('ChannelPool').load(function() {
        $logger.info('Channel pool is ready');
    });*/
};
