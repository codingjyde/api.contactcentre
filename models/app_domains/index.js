const mongoose = require('mongoose');

const DomainStatus = require("../../constants/domain_status");

const basePlugin = require('../_base');

const entityName = 'Domain';

const recordSchema = new mongoose.Schema({
    type: {
        trim: true,
        type: String,
    },
    name: {
        trim: true,
        type: String,
    },
    value: {
        trim: true,
        type: String,
    },
    priority: {
        trim: true,
        type: Number,
    }
});

const schema = new mongoose.Schema({
    organisation: {
        ref: "Organisation",
        required: true,
        type: String
    },
    name: {
        index: true,
        maxLength: 253,
        required: true,
        trim: true,
        type: String,
    },
    records: [
        recordSchema
    ],
    status: {
        enum: [
            DomainStatus.FAILED,
            DomainStatus.PENDING,
            DomainStatus.VERIFIED
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_domains',
});

schema.plugin(basePlugin, {
    entityName,
});

const Domain = mongoose.model(entityName, schema);

module.exports = Domain;