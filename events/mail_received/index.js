const { EventEmitter } = require('events');

// Create a custom EventEmitter instance
const mailReceivedEventEmitter = new EventEmitter();

// Function to emit the 'mailReceived' event
function emitMailReceivedEvent({ queueDetails, storeDetails }) {
    mailReceivedEventEmitter.emit('mailReceived', { queueDetails, storeDetails });
}

// Function to listen for the 'mailReceived' event
function onMailReceivedListener(callback) {
    mailReceivedEventEmitter.on('mailReceived', callback);
}

module.exports = {
    emitMailReceivedEvent,
    onMailReceivedListener,
};
