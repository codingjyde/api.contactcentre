const mongoose = require('mongoose');

const ChannelAccount = require('../app_channel_accounts');

const cryptoService = require("../../services/crypto");

const CLIENT_ID_LENGTH = 20;

const schema = new mongoose.Schema({
    url: {
        index: true,
        maxLength: 2048,
        required: true,
        trim: true,
        type: String,
    },
    clientId: {
        default: function() {
            return cryptoService.getRandomString(CLIENT_ID_LENGTH);
        },
        index: true,
        maxLength: CLIENT_ID_LENGTH,
        required: true,
        trim: true,
        type: String,
    }
}, {
    discriminatorKey: 'type',
});
    
const WebChatAccount = ChannelAccount.discriminator('WebChatAccount', schema);

module.exports = WebChatAccount;