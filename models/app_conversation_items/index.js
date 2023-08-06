const mongoose = require('mongoose');

const ConversationItemMode = require("../../constants/conversation_item_mode");
const ConversationItemType = require('../../constants/conversation_item_type');

const basePlugin = require('../_base');

const Person = require("../sub_persons");

const entityName = 'ConversationItem';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    conversation: {
        ref: "Conversation",
        required: true,
        type: String
    },
    sender: {
        type: Person
    },
    text: {
        required: true,
        type: mongoose.Schema.Types.Mixed
    },
    html: {
        required: true,
        type: mongoose.Schema.Types.Mixed
    },
    mode: {
        enum: [
            ConversationItemMode.PRIVATE,
            ConversationItemMode.PUBLIC,
            ConversationItemMode.SYSTEM
        ],
        required: true,
        type: Number
    },
    type: {
        enum: [
            ConversationItemType.EMAIL,
            ConversationItemType.PRIVATE_NOTE,
            ConversationItemType.SYSTEM,
            ConversationItemType.TELEPHONE_CALL,
            ConversationItemType.UNKNOWN,
            ConversationItemType.WEB_CHAT_POST,
        ],
        required: true,
        type: Number
    },
    dateSent: {
        type: Number
    },
}, {
    collection: 'app_conversation_items'
});

schema.plugin(basePlugin, {
    entityName,
});

const ConversationItem = mongoose.model(entityName, schema);

module.exports = ConversationItem;