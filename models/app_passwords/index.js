const mongoose = require("mongoose");

const PasswordStatus = require("../../constants/password_status");

const basePlugin = require("../_base");

const entityName = "Password";

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    user: {
        ref: 'User',
        required: true,
        type: String,
    },
    hash: {
        index: true,
        maxLength: 64,
        required: true,
        type: String,
    },
    salt: {
        index: true,
        maxLength: 64,
        required: true,
        type: String, 
    },
    status: { 
        enum: [ 
            PasswordStatus.ACTIVE,
            PasswordStatus.OBSOLETE,
            PasswordStatus.PENDING
        ],
        index: true,
        required: true,
        type: Number,
    },
}, { 
    collection: 'app_passwords'
});

schema.plugin(basePlugin, {
    entityName
});

const Password = mongoose.model(entityName, schema);

module.exports = Password;