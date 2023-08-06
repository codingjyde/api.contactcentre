const mongoose = require('mongoose');

const UserStatus = require('../../constants/user_status');

const basePlugin = require('../_base');

const entityName = 'User';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    firstName: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    middleName: {
        index: true,
        maxLength: 64,
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
    requiresPasswordChange: {
        required: true,
        type: Boolean,
    },
    roomName: {
        type: String
    },
    status: {
        enum: [
            UserStatus.ACTIVE,
            UserStatus.SUSPENDED
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_users',
    discriminatorKey: 'type',
});

schema.plugin(basePlugin, {
    entityName,
});

const User = mongoose.model(entityName, schema);

module.exports = User;