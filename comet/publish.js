/**
 *  消息发布模块
 */
var redis = require( 'redis' );

var host = CONFIG.redisServerHost || '127.0.0.1';
var port = CONFIG.redisServerPort || '6379';

// start redis client
var SubMsgClient = redis.createClient( port, host, {

});



// Prevent redis calling exit
SubMsgClient.on( 'error', function( error ) {

	logger.error( '消息接收 redis 客户度异常：' + error.message );
});

exports.init = function() {

    // fix 定义在顶部会产生 循环依赖的问题
    var ChannelManager = require( './channel.js' ).ChannelManager;

    require( '../project/publish.js' ).init( SubMsgClient );

    SubMsgClient.on( "message" , function ( channel, message ) {

        logger.debug( 'redis 消息接收客户端收到 channel：'+ channel +'-----message：' + message );

        ChannelManager.publish( channel, message );
    });
};

exports.SubMsgClient = SubMsgClient;