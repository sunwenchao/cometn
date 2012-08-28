var _ = require( 'underscore' );

/**
 * 消息类
 * @param oriData
 * @constructor
 */
var Message = function( oriData ) {

    // 转换 json 格式
    try {
        this.data = JSON.parse( oriData );

    } catch ( err ) {
        this.data = {
            type : 'error',
            data : 'json parse error'
        };
    }

};

_.extend( Message.prototype, {

    getType : function() {

        return this.data.type || false;
    },

    getChannel : function() {

        return this.data.channel || false;
    }



});





module.exports = Message;