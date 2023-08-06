const mongoose = require('mongoose');

const ConversationStatus = require("../../constants/conversation_status");

const basePlugin = require('../_base');

const entityName = 'Conversation';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    channelAccount: {
        ref: "ChannelAccount",
        required: true,
        type: String
    },
    contactAccount: {
        ref: "ContactAccount",
        required: true,
        type: String
    },
    mergeId: {
        type: String
    },
    status: {
        enum: [
            ConversationStatus.ABANDONED_BY_AGENT,
            ConversationStatus.ABANDONED_BY_CONTACT,
            ConversationStatus.ACCEPTED,
            ConversationStatus.CLOSED_BY_AGENT,
            ConversationStatus.CLOSED_BY_CONTACT,
            ConversationStatus.INITIALISED,
            ConversationStatus.IN_PROGRESS          
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_conversations'
});

schema.plugin(basePlugin, {
    entityName,
});

const Conversation = mongoose.model(entityName, schema);

module.exports = Conversation;