var Memcache = require('../store/Memcache');
var OAuth2Code = require('../model/OAuth2Code');

function OAuth2CodeMemcache() {
    Memcache.call(this, OAuth2Code, $config.get('servers.memcache.master'));
}

$util.inherits(OAuth2CodeMemcache, Memcache);

module.exports = exports = OAuth2CodeMemcache;