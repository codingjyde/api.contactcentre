const { EventEmitter } = require('events');

const itemDeletedEventEmitter = new EventEmitter();

function emitItemDeletedEvent({ collectionName, id }) {
    itemDeletedEventEmitter.emit('itemDeleted', { collectionName, id });
}

function onItemDeletedListener(callback) {
    itemDeletedEventEmitter.on('itemDeleted', callback);
}

module.exports = {
    emitItemDeletedEvent,
    onItemDeletedListener,
};