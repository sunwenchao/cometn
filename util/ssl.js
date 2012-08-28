/**
 * 返回证书对象
 * @return {*}
 */
module.exports = function() {

    var keysPath = projectPath + '/keys';

    if ( fs.existsSync( keysPath + '/privatekey.pem' ) &&
        fs.existsSync( keysPath + '/certificate.pem' ) ) {

        var privateKey = fs.readFileSync( keysPath + '/privatekey.pem', 'utf8' );
        var certificate = fs.readFileSync( keysPath + '/certificate.pem', 'utf8' );

        return { key : privateKey, cert : certificate }; // server options

    } else {

        logger.error( '证书读取错误！' );
        return false;
    }
};