const mongoose = require('mongoose');

const LabelStatus = require("../../constants/label_status");

const basePlugin = require('../_base');

const entityName = 'Label';

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    name: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    colour: {
        index: true,
        maxLength: 32,
        required: true,
        trim: true,
        type: String,
    },
    status: {
        enum: [
            LabelStatus.ACTIVE,
            LabelStatus.SUSPENDED
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_labels',
    discriminatorKey: 'type',
});

schema.plugin(basePlugin, {
    entityName,
});

const Label = mongoose.model(entityName, schema);

module.exports = Label;