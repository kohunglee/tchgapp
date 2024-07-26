var events = {};

// 订阅
function on(name, self, callback) {
    var tuple = [self, callback];
    var callbacks = [];
    callbacks = events[name];
    if (Array.isArray(callbacks)) {
        callbacks.splice(name, 1)
        callbacks.push(tuple);
    } else {
        events[name] = [tuple];
    }
}
// 移除
function remove(name, self) {
    var callbacks = events[name];
    if (Array.isArray(callbacks)) {
        events[name] = callbacks.filter((tuple) => {
            return tuple[0] != self;
        })
    }
}
// 发出
function emit(name, data) {
    var callbacks = events[name];
    if (Array.isArray(callbacks)) {
        callbacks.map((tuple) => {
            var self = tuple[0];
            var callback = tuple[1];
            callback.call(self, data);
        })
    }
}

wx.$event = {
    on: on,
    remove: remove,
    emit: emit
};

exports = wx.$event;