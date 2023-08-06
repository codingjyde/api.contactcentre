const { EventEmitter } = require('events');

const itemUpdatedEventEmitter = new EventEmitter();

function emitItemUpdatedEvent({ collectionName, data, id }) {
    itemUpdatedEventEmitter.emit('itemUpdated', { collectionName, data, id });
}

function onItemUpdatedListener(callback) {
    itemUpdatedEventEmitter.on('itemUpdated', callback);
}

module.exports = {
    emitItemUpdatedEvent,
    onItemUpdatedListener,
};