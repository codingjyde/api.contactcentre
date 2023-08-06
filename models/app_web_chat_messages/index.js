const mongoose = require('mongoose');

const WebChatMessageType = require("../../constants/web_chat_message_type");

const basePlugin = require('../_base');

const Person = require("../sub_persons");

const entityName = 'WebChatMessage';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    session: {
        ref: "WebChatSession",
        required: true,
        type: String
    },
    content: {
        index: true,
        required: true,
        trim: true,
        type: String,
    },
    sender: {
        required: true,
        type: Person
    },
    readReceipts: [{
        name: {
            required: true,
            trim: true,
            type: String
        },
        emailAddress: {
            required: true,
            trim: true,
            type: String
        },
        date: {
            required: true,
            type: Number
        },    
    }],
    type: {
        enum: [
            WebChatMessageType.SYSTEM,
            WebChatMessageType.TEXT,
        ],
        required: true,
        type: Number,
    }
}, {
    collection: 'app_web_chat_messages',
});


schema.plugin(basePlugin, {
    entityName,
});

const WebChatMessage = mongoose.model(entityName, schema);

module.exports = WebChatMessage;