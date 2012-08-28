/**
 * Comet 系统配置信息
 * @type {Object}
 */
module.exports = {

    // node 服务器侦听端口
    serverPort : 9000,

    // 是否使用 https 服务器
    httpsServer : false,

    // redis 消息服务器地址
    redisServerHost : '',
    redisServerPort : '6379',

    // 订阅验证
    sub_authorization : '/project/authorization',

    // 订阅验证 session-manager redis 地址
    SM_redisServerHost : '',
    SM_redisServerPort : '6379',

    // 是否使用 redis 暂存消息
    useRedis : false


};