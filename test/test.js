var LComet = function(options){

    this.handlers = {};

    this.io = io.connect(options.host);

    this.io.on("connect",    this.proxy(this.onconnect));
    this.io.on("message",    this.proxy(this.onmessage));
    this.io.on("disconnect", this.proxy(this.ondisconnect));
    this.io.on("sub_channel",    this.proxy(this.onchannel));
//    this.on("connect", this.proxy(this.writeMeta));
};

// Helper methods

LComet.fn = LComet.prototype;
LComet.fn.proxy = function(func){
    var thisObject = this;
    return(function(){ return func.apply(thisObject, arguments); });
};

// Public methods

LComet.fn.on = function(name, callback){
    if ( !name || !callback ) return;
    if ( !this.handlers[name] ) this.handlers[name] = [];
    this.handlers[name].push(callback);
};
LComet.fn.bind = LComet.fn.on;

LComet.fn.unbind = function(name){
    if (!this.handlers) return;
    delete this.handlers[name];
};

LComet.fn.write = function(message){
    if (typeof message.toJSON == "function")
        message = message.toJSON();

    this.io.send(message);
};

LComet.fn.subscribe = function(channel, callback){
    if ( !channel ) throw "Must provide a channel";

    this.on(channel + ":data", callback);

    var connectCallback = this.proxy(function(){
        var message     = new LComet.Message;
        message.type    = "subscribe";
        message.channel = channel;

        this.write(message);
    });

    if (this.io.socket.connected)
        connectCallback();
    else {
        this.on("connect", connectCallback);
    }
};

LComet.fn.unsubscribe = function(channel) {
    if ( !channel ) throw "Must provide a channel";

    this.unbind(channel + ":data");

    var message     = new LComet.Message;
    message.type    = "unsubscribe";
    message.channel = channel;

    this.write(message);
};

// Private

LComet.fn.trigger = function(){
    var args = [];
    for (var f=0; f < arguments.length; f++) args.push(arguments[f]);

    var name  = args.shift();

    var callbacks = this.handlers[name];
    if ( !callbacks ) return;

    for(var i=0, len = callbacks.length; i < len; i++)
        callbacks[i].apply(this, args);
};

LComet.fn.writeMeta = function(){
    if ( !this.meta ) return;
    var message     = new LComet.Message;
    message.type    = "meta";
    message.data    = this.meta;
    this.write(message);
};

LComet.fn.onconnect = function(){
    this.sessionID = this.io.socket.sessionid;
    this.trigger("connect");
};

LComet.fn.onchannel = function(data){
    this.trigger("channel",data);
};

LComet.fn.ondisconnect = function(){
    this.trigger("disconnect");
};

LComet.fn.onmessage = function(data){
    var message = LComet.Message.fromJSON(data);
    this.trigger("message", message);
    this.trigger("data", message.channel, message.data);
    this.trigger(message.channel + ":data", message.data);
};

LComet.Message = function(hash){
    for (var key in hash) this[key] = hash[key];
};

LComet.Message.fromJSON = function(json){
    return(new this(JSON.parse(json)))
};

LComet.Message.prototype.toJSON = function(){
    var object = {};
    for (var key in this) {
        if (typeof this[key] != "function")
            object[key] = this[key];
    }
    return(JSON.stringify(object));
};
