const mongoose = require('mongoose');

const PasswordResetRequestStatus = require("../../constants/password_reset_request_status");

const basePlugin = require('../_base');

const entityName = 'PasswordResetRequest';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    user: {
        ref: "User",
        required: true,
        type: String,
    },
    code: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    expiryDate: {
        index: true,
        required: true,
        type: Number,
    },
    status: {
        enum: [
            PasswordResetRequestStatus.EXPIRED,
            PasswordResetRequestStatus.PENDING,
            PasswordResetRequestStatus.PROCESSED
        ],
        required: true,
        type: Number,
    }
}, {
    collection: 'app_password_reset_requests'
});

schema.plugin(basePlugin, {
    entityName,
});

const PasswordResetRequest = mongoose.model(entityName, schema);

module.exports = PasswordResetRequest;