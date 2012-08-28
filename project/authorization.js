var http = require( 'http' );

var redis = require( 'redis' );

var host = CONFIG.SM_redisServerHost || '127.0.0.1';
var port = CONFIG.SM_redisServerPort || '6379';

// start redis client
var LabiSMredis = redis.createClient( port, host, {

});

// Prevent redis calling exit
LabiSMredis.on( 'error', function( error ) {

    logger.error( 'Labi 验证 sessionManager redis 客户端出错：' + error );
});


module.exports = function( handshakeData, callback ) {

    // 客户端传来的 cookie 中的 sessionId
    var sessionId = handshakeData.query.sid,

        jidKey = CONFIG.SM_redisJidKey || 'jid';

    // 验证登陆状态
    if( sessionId ) {

        var verifiedChannels = [];

        verifiedChannels.push( 'labi_public' ); // 增加 公共频道

        // 保存 可订阅频道
        handshakeData.channels = verifiedChannels;

        // 连接 sessionManager redis 获取对应 jid
        LabiSMredis.hget( sessionId, jidKey, function( err, reply ) {

            if ( err ) {

                logger.error( 'SM redis 验证过程出错：' + err );
                return callback( 'Session id authorization error.', false );
            }

            if( reply ) {

                var jid = reply;

                // 保存 uid
                handshakeData.uid = jid;

                // 私有频道名称
                var privateChannelName = 'test_private_' + jid;

                verifiedChannels.push( privateChannelName ); // 增加 私人频道

                return callback( null, true );

            } else {

                logger.error( '握手 cookie-sid 验证失败：cookie：' + sessionId + '  --- reply：' + reply );
                return callback( 'Session id authorization failed.', false );
            }
        });

    } else {

        logger.error( '握手尝试失败，未携带 cookie-sid ----- ' + sessionId );
        return callback( 'No cookie transmitted.', false );
    }

};