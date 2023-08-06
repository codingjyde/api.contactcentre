const mongoose = require('mongoose');

const User = require('../app_users');

const schema = new mongoose.Schema({

}, {
    discriminatorKey: 'type',
});

const HostUser = User.discriminator('HostUser', schema);

module.exports = HostUser;