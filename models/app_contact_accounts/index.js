const mongoose = require('mongoose');

const ContactAccountType = require("../../constants/contact_account_type");

const basePlugin = require('../_base');

const entityName = 'ContactAccount';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    contact: {
        ref: "Contact",
        required: true,
        type: String
    },
    value: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    isVerified: {
        required: true,
        type: Boolean,
    },
    type: {
        enum: [
            ContactAccountType.EMAIL_ADDRESS,
            ContactAccountType.TELEPHONE_NUMBER
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_contact_accounts'
});

schema.plugin(basePlugin, {
    entityName,
});

const ContactAccount = mongoose.model(entityName, schema);

module.exports = ContactAccount;