const mongoose = require('mongoose');

const Gender = require("../../constants/gender");

const basePlugin = require('../_base');

const entityName = 'Contact';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    title: {
        index: true,
        maxLength: 64,
        trim: true,
        type: String,
    },
    firstName: {
        index: true,
        maxLength: 64,
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
        trim: true,
        type: String,
    },
    gender: {
        enum: [
            Gender.UNKNOWN,
            Gender.MALE,
            Gender.FEMALE,
        ],
        type: Number
    }
}, {
    collection: 'app_contacts',
});

schema.plugin(basePlugin, {
    entityName,
});

const Contact = mongoose.model(entityName, schema);

module.exports = Contact;