const { EventEmitter } = require('events');

// Create a custom EventEmitter instance
const mailProcessedEventEmitter = new EventEmitter();

// Function to emit the 'mailProcessed' event
function emitMailProcessedEvent(key) {
    mailProcessedEventEmitter.emit('mailProcessed', key);
}

// Function to listen for the 'mailProcessed' event
function onMailProcessedListener(callback) {
    mailProcessedEventEmitter.on('mailProcessed', callback);
}

module.exports = {
    emitMailProcessedEvent,
    onMailProcessedListener,
};
