const mongoose = require('mongoose');

const User = require('../app_users');

const schema = new mongoose.Schema({
    organisation: {
        ref: "Tenant",
        required: true,
        type: String
    }
}, {
    discriminatorKey: 'type',
});

const TenantUser = User.discriminator('TenantUser', schema);

module.exports = TenantUser;