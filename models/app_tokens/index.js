const mongoose = require("mongoose");

const TokenStatus = require("../../constants/token_status");

const basePlugin = require("../_base");

const entityName = "Token";

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
        maxLength: 128,
        required: true,
        type: String,
    },
    salt: {
        index: true,
        maxLength: 64,
        required: true,
        type: String,
    },
    expiryDate: {
        index: true,
        required: true,
        type: Number
    },
    status: {
        enum: [
            TokenStatus.ACTIVE,
            TokenStatus.OBSOLETE
        ],
        index: true,
        required: true,
        type: Number,
    },
}, { 
    collection: 'app_tokens'
});

schema.plugin(basePlugin, {
    entityName
});

const Token = mongoose.model(entityName, schema);

module.exports = Token;