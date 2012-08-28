/**
 * Comet 系统入口程序
 * @type {*}
 */
var http = require( 'http' );
var https = require( 'https' );
var fs = require( 'fs' );
var log4js = require( 'log4js' );

global.projectPath = __dirname;

log4js.configure( './config/log.json', {} );

var CONFIG = global.CONFIG = require( './config/config' ); // 全局配置信息
var logger = global.logger = log4js.getLogger( 'test' ); // 全局日志工具



var Socket_io = require( './comet/socket-io' ); // socket.io 模块

var App; // 服务器对象

if( !CONFIG.httpsServer ) {
    // HTTP 服务器
    App = http.createServer();

} else {
    // HTTPS 服务器
    var credentials = require( './util/ssl' )();

    if( !credentials ) process.exit( 1 );

    App = https.createServer( credentials );
}

var serverPort = CONFIG.serverPort || 80;
var oriServer = App.listen( serverPort ); // 返回原始 server 对象，供 Socket_io 处理

logger.fatal( '服务器成功启动！监听端口：' + serverPort );

// 捕获输出异常
process.on( 'uncaughtException', function ( err ) {
    logger.error( 'Caught exception: ' + err );
});

Socket_io.init( oriServer ); // 初始化 Socket_io 模块

// 初始 redis 消息接收处理
require( './comet/publish').init();

