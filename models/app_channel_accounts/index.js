const mongoose = require('mongoose');

const Channel = require("../../constants/channel");
const ChannelAccountStatus = require("../../constants/channel_account_status");

const basePlugin = require('../_base');

const entityName = 'ChannelAccount';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation", 
        required: true,
        type: String
    },
    name: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    type: {
        enum: [
            Channel.EMAIL,
            Channel.TELEPHONY,
            Channel.UNKNOWN,
            Channel.WEB_CHAT
        ],
        required: true,
        type: Number,
    },
    status: {
        enum: [
            ChannelAccountStatus.ACTIVE,
            ChannelAccountStatus.SUSPENDED            
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_channel_accounts'
});

schema.plugin(basePlugin, {
    entityName,
});

const ChannelAccount = mongoose.model(entityName, schema);

module.exports = ChannelAccount;