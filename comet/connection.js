var _ = require( 'underscore' );

var Message = require( './message' );

var ChannelManager = require( './channel').ChannelManager;

/**
 * Connection 类, 封装 socket 对象
 * @param socket
 * @constructor
 */
var Connection = function( oriSocket ) {

    this.socket = oriSocket;

    this.id = oriSocket.id;

    // 握手时确定的此次连接可订阅的 channels
    this.verifiedChannels = this.socket.handshake.channels;

    // 用户 id
    this.uid = this.socket.handshake.uid || 'Unknown_user';

    logger.info( '新建立连接： id：' + this.id + ' ----- user：' + this.uid );

    // 向客户端发送可订阅频道通知
    this.socket.emit( 'info', {
        uid : this.uid
    });

    this.init();
};

_.extend( Connection.prototype, {

    // 连接初始化处理
    init : function() {
        var self = this;

        _.bindAll( self, '_onMessage', '_onDisconnect' );

        // 托管 socket 事件
        this.socket.on( 'message', self._onMessage );
        this.socket.on( 'disconnect', self._onDisconnect );
    },

    // 接收到客户端消息后的处理
    _onMessage : function( data ) {

        var self = this,
            msg = new Message( data );

        // 根据消息类型处理消息
        switch ( msg.getType() ) {

            case 'subscribe':
                self._subscribe( msg );
                break;

            case 'unsubscribe':
                self._unsubscribe( msg );
                break;

            case 'meta':
                self._onMetaMessage( msg );
                break;

            case 'error':
                self._onErrorMessage( msg );
                break;
            
            default:
                throw 'Unknown Message type'
        }

    },

    // 客户端订阅channel
    _subscribe : function( msg ) {

        var msgChannel = msg.getChannel();

        if ( !msgChannel ) this.write( 'Channel read failed, data error' );

        // 验证是否可被订阅
        if ( this.verifiedChannels && _.indexOf( this.verifiedChannels, msgChannel ) !== -1 ) {

            // 在 channel 模块中实现 连接订阅频道
            ChannelManager.subscribe( msgChannel, this );

        } else {

            this.write( 'Authorization failed, subscribe error' );
        }

    },

    // 客户端取消订阅channel
    _unsubscribe : function( msg ) {

        var msgChannel = msg.getChannel();

        if ( !msgChannel ) this.write( 'Channel read failed, data error' );

        ChannelManager.unSubscribe( msgChannel, this );
    },

    // 暂留系统信息处理
    _onMetaMessage : function() {

    },

    // 客户端连接断开
    _onDisconnect : function() {

        // Unsubscribe from all channels
        ChannelManager.unSubscribeAll( this );

        logger.info( '连接断开： id：' + this.id + ' ----- user：' + this.uid );

        delete this;
    },

    // 客户端发送消息格式错误
    _onErrorMessage : function() {

        this.write( 'Message read failed, data error' );
    },

    // 向客户端发送消息
    write : function( message ) {

        try {

            // json 数据输出转换后的字符串
            if( typeof message === 'object' ) message = JSON.stringify( message );

            this.socket.send( message );

        } catch ( err ) {

            logger.error( '消息发送错误：' + err );
        }
    }


});

module.exports = Connection;