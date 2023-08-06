const mongoose = require('mongoose');

const EmailMessageStatus = require("../../constants/email_message_status");

const basePlugin = require('../_base');

const entityName = 'EmailMessage';

const addressSchema = new mongoose.Schema({
    name: String,
    address: String,
});

const attachmentSchema = new mongoose.Schema({
    filename: String,
    content: String, // You can use Buffer type if you want to store binary data
    contentType: String,
});

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        type: String
    },
    channelAccount: {
        ref: "ChannelAccount",
        type: String
    },
    conversationItem: {
        ref: "ConversationItem",
        type: String
    },
    messageId: {
        type: String    
    },
    messageKey: {
        type: String    
    },
    subject: {
        type: String    
    },
    from: addressSchema,
    to: [ 
        addressSchema
    ],
    cc: [ 
        addressSchema
    ],
    bcc: [ 
        addressSchema
    ],
    inReplyTo: {
        type: String    
    },
    replyTo: addressSchema,
    references: [
        String
    ],
    html: {
        type: String    
    },
    text: {
        type: String    
    },
    textAsHtml: {
        type: String    
    },
    attachments: [
        attachmentSchema
    ],
    dateSent: {
        type: Number
    },
    dateRetrieved: {
        type: Number
    },
    dateProcessed: {
        type: Number
    },
}, {
    collection: 'app_email_messages',
});

schema.plugin(basePlugin, {
    entityName,
});

const EmailMessage = mongoose.model(entityName, schema);

module.exports = EmailMessage;