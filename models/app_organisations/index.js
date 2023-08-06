const mongoose = require('mongoose');

const OrganisationStatus = require("../../constants/organisation_status");

const basePlugin = require('../_base');

const entityName = 'Organisation';

const schema = new mongoose.Schema({
    name: {
        index: true,
        maxLength: 64,
        required: true,
        trim: true,
        type: String,
    },
    status: {
        enum: [
            OrganisationStatus.ACTIVE,
            OrganisationStatus.SUSPENDED            
        ],
        required: true,
        type: Number
    }
}, {
    collection: 'app_organisations',
    discriminatorKey: 'type'
});

schema.plugin(basePlugin, {
    entityName,
});

const Organisation = mongoose.model(entityName, schema);

module.exports = Organisation;