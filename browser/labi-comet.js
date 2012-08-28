/**
 * LComet 构造方法
 * @constructor
 */
var LComet = function( options ) {

    var self = this;

    _.extend( self, Backbone.Events );

    self.socket = window.io.connect( options.host );

    self.socketInfo = self.socket.socket;

    self._initIoEvents();
};


_.extend( LComet.prototype, {

    _initIoEvents : function() {

        var self = this;

        self.socket.on( 'connect', function() {

            self.sessionID = self.socketInfo.sessionid;

            self.trigger( 'connect' );
        });

        self.socket.on( 'disconnect', function() {
            self.trigger( 'disconnect' );
        });

        self.socket.on( 'message', function( data ) {
            self._onMessage( data );
        });

        self.socket.on( 'info', function( data ) {
            self.trigger( 'info', data );
        });
    },

    subscribe : function( channel, callback ) {

        if ( !channel || !callback ) return false;

        this.off( channel + ':data' );
        this.on( channel + ':data', callback );

        var self = this,

            connectCallback = function() {
                var message = {};
                message.type = 'subscribe';
                message.channel = channel;

                self.write( message );
            };

        if ( this.socketInfo.connected )
            connectCallback();
        else {
            this.on( 'connect', connectCallback );
        }
    },

    unSubscribe : function( channel ) {

        if ( !channel ) return false;

        this.off( channel + ":data" );

        var message     = {};
        message.type    = "unsubscribe";
        message.channel = channel;

        this.write(message);
    },

    _onMessage : function( data ) {

        var message = JSON.parse( data );

        this.trigger("message", message);
        this.trigger("data", message.channel, message.data);
        this.trigger(message.channel + ":data", message.data);
    },

    write : function( message ) {

        if( typeof message === 'object' ) message = JSON.stringify( message );

        this.socket.send( message );
    }




});