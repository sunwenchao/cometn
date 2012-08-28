var _ = require( 'underscore');

var SubMsgClient = require( './publish.js').SubMsgClient;

// 所有频道
var globalChannels = {};

/**
 * 频道管理器
 * @type {Object}
 */
var ChannelManager = {

    // 单个连接订阅单个频道
    subscribe : function( channelName, connection ) {

        var channel = globalChannels[ channelName ];

        if( channel ) {

            // 已存在频道 直接添加
            channel.add( connection );

        } else {

            // 频道不存在 则新建
            var newChannel = new Channel( channelName );

            newChannel.add( connection );

            globalChannels[ channelName ] = newChannel;
        }
    },

    // 单个连接取消订阅单个频道
    unSubscribe : function( channelName, connection ) {

        var channel = globalChannels[ channelName ];

        if( channel ) {
            // 执行退出频道
            channel.remove( connection );

        } else {

            logger.warn( 'UnSubscribe error, no channel:' + channelName );
        }
    },

    // 单个连接取消订阅所有对应频道
    unSubscribeAll : function( connection ) {

        // 查找该连接所有可能订阅的频道 依次移除
        _.each( connection.verifiedChannels, function( channelName ) {

            if( globalChannels[ channelName ] ) {

                globalChannels[ channelName ].remove( connection );
            }
        });
    },

    // 向频道中发布消息
    publish : function( channel, msg ) {

        // 判断该频道是否可发布
        if ( globalChannels[ channel ] && globalChannels[ channel ].publishMessage ) {

            // 向频道中发布信息
            globalChannels[ channel ].publishMessage({
                channel : channel,
                data : msg
            });

        } else {

            // 频道不存在 忽略
            return false;
        }
    }

};


/**
 * 频道类
 * @param name
 * @constructor
 */
var Channel = function( name ) {

    this.name = name; // 频道名称

    this.connections = []; // 频道内所有连接

    SubMsgClient.subscribe( this.name );

    logger.debug( '频道：' + this.name + '   开启' );
};


_.extend( Channel.prototype, {

    // 添加连接进入此频道
    add : function( connection ) {

        var self = this,

            exists = _.any( self.connections, function ( con ) {
                return con.id === connection.id;
            });

        if( exists ) return logger.warn( '连接：' + connection.id + '   重复加入频道：' + this.name );

        logger.debug( '连接：' + connection.id + '   加入频道：' + self.name );

        this.connections.push( connection );
    },

    // 在此频道中移除连接
    remove : function( connection ) {

        var self = this;

        self.connections = _.reject( self.connections, function( con ) {
            return con.id === connection.id;
        });

        logger.debug( '连接：' + connection.id + '   退出频道：' + self.name );

        self._checkInvalid();
    },

    // 向此频道中发布信息
    publishMessage : function( msg ) {

        var self = this;

        // 遍历频道中所有连接 写入消息
        _.each( self.connections, function( con ) {

            con.write( msg );
        });
    },

    // 检测自身是否失效
    _checkInvalid : function() {

        // 测试频道中连接是否全部清空
        if( this.connections.length === 0 ) {

            globalChannels[ this.name ] = false;

            logger.debug( '频道：' + this.name + '   关闭' );

            // redis 消息接收 不再订阅此频道
            SubMsgClient.unsubscribe( this.name );

            delete  this;
        }
    }

});

// 对外频道管理器
exports.ChannelManager = ChannelManager;