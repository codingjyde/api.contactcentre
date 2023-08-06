const { EventEmitter } = require('events');

const itemInsertedEventEmitter = new EventEmitter();

function emitItemInsertedEvent({ collectionName, data, id }) {
    itemInsertedEventEmitter.emit('itemInserted', { collectionName, data, id });
}

function onItemInsertedListener(callback) {
    itemInsertedEventEmitter.on('itemInserted', callback);
}

module.exports = {
    emitItemInsertedEvent,
    onItemInsertedListener,
};