var express = require( 'express' );

/**
 * 初始化发布服务器相关服务
 * @param App
 */
exports.init = function( App ) {

    initAppConfig( App );

    initAppRouter( App );
};

// 发布服务路由处理
function initAppRouter( app ) {

    app.post( '/publish', function( req, res ) {

        var reqItem = req.body;

        console.log( req );
    });

}

// 服务器环境配置
function initAppConfig( app ) {

    app.configure( function() {

        app.use( express.logger() );

        app.use( express.bodyParser() );
        app.use( express.methodOverride() );

        app.use( express.errorHandler() );

        app.use( app.router );
    });
}