const mongoose = require('mongoose');

const ConversationStatus = require("../../constants/conversation_status");
const WebChatMemberMode = require("../../constants/web_chat_member_mode");
const WebChatMemberRole = require("../../constants/web_chat_member_role");
const WebChatMemberStatus = require("../../constants/web_chat_member_status");

const basePlugin = require('../_base');

const entityName = 'WebChatSession';

const memberSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    firstName: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    surname: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    emailAddress: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    dateJoined: {
        required: true,
        type: Number,
    },
    mode: {
        enum: [
            WebChatMemberMode.OVERT,    
            WebChatMemberMode.STEALTH,    
        ],
        required: true,
        type: Number
    },
    role: {
        enum: [
            WebChatMemberRole.AGENT,
            WebChatMemberRole.CONTACT,
            WebChatMemberRole.SUPERVISOR
        ],
        required: true,
        type: Number
    },
    status: {
        enum: [
            WebChatMemberStatus.JOINED,
            WebChatMemberStatus.LEFT    
        ],
        required: true,
        type: Number
    }
});

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    account: {
        ref: "WebChatAccount",
        required: true,
        type: String
    },
    members: [ memberSchema ],
    dateInitialised: {
        required: true,
        type: Number,
    },
    dateAccepted: {
        type: Number,
    },
    dateInProgress: {
        type: Number,
    },
    dateAbandoned: {
        type: Number,
    },
    dateClosed: {
        type: Number,
    },
    dateUpdated: {
        type: Number,
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
    collection: 'app_web_chat_sessions',
});

schema.plugin(basePlugin, {
    entityName,
});

const WebChatSession = mongoose.model(entityName, schema);

module.exports = WebChatSession;