var Collector = $require('util.Collector');
var Async = $require('util.Async');
var JUAction = $require('action.JUAction');
var Template = $require('template.Template');
var Prefacer = $require('prefacer.Prefacer');
var Service = $require('service.Service');
var User = $require('model.User');

/**
 * 
 */
function Login(req, res) {
    var name = $config.get('sign.action.login') || 'login';
    JUAction.call(this, name, req, res);
}

$util.inherits(Login, JUAction);

module.exports = exports = Login;

Login.prototype.launch = function() {
    var sessid = $config.get('sign.cookie.session') || 'sid';
    var request = this.scope.request();
    //清除seesion memcache user
    this.prefacer.remove();
    //清除cookie
    this.response.clearCookie(sessid);
    //成功登出响应
    this.template.redirect(request.refer?request.refer:'/login');
};