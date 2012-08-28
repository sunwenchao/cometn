var io = require( 'socket.io' );

var Connection = require( './connection' ); // Connection 模块

var SocketIo;

// 初始化 socket.io 相关信息
exports.init = function( appServer ) {

    SocketIo = io.listen( appServer );

    initEnv();

    initAuthorization();

    logger.fatal( 'socket.io 模块初始化完毕' );

    // socket.io 连接事件
    SocketIo.sockets.on( 'connection', function ( socket ) {

        new Connection( socket ); // 交给 Connection 模块处理
    });
};

// 验证信息配置
function initAuthorization() {

    SocketIo.set( 'authorization', function( handshakeData, callback ) {

        if ( CONFIG.sub_authorization ) {
            // 执行配置指定的验证
            require( projectPath + CONFIG.sub_authorization )( handshakeData, callback );

        } else {
            // 忽略验证
            callback( null, true );
        }
    });

}

// 环境信息配置
function initEnv() {

    // 日志输出级别 0-3
    //    0 - error
    //    1 - warn
    //    2 - info
    //    3 - debug
    SocketIo.set( 'log level', 0 );

    // Enable the flash policy server if the flashsocket transport is enabled.
    SocketIo.set( 'flash policy server', false );

//    Meant to be used when running socket.io behind a proxy.
//    Should be set to true when you want the location handshake to match the protocol of the origin.
//    This fixes issues with terminating the SSL in front of Node and forcing location to think it's wss instead of ws.
//    SocketIo.set( 'match origin protocol', true );

    // 传输方式
    SocketIo.set( 'transports', [
        'websocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ]);

    // The origins that are allowed to connect to the Socket.IO server.
//    SocketIo.set( 'origins', '*:*' );

    // Does Socket.IO need to serve the static resources like socket.io.js and WebSocketMain.swf etc.
    SocketIo.set( 'browser client', false );
//    SocketIo.enable( 'browser client minification' );  // send minified client
//    SocketIo.enable( 'browser client etag' );          // apply etag caching logic based on version number
//    SocketIo.enable( 'browser client gzip' );          // gzip the file

    // By : https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
}