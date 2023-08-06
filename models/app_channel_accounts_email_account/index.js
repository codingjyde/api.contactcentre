const mongoose = require('mongoose');

const ChannelAccount = require('../app_channel_accounts');

const schema = new mongoose.Schema({
    address: {
        index: true,
        maxLength: 320,
        required: true,
        trim: true,
        type: String,
    }
}, {
    discriminatorKey: 'type',
});
    
const EmailAccount = ChannelAccount.discriminator('EmailAccount', schema);

module.exports = EmailAccount;