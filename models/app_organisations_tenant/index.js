const mongoose = require('mongoose');

const Organisation = require('../app_organisations');

const schema = new mongoose.Schema({

}, {
    discriminatorKey: 'type',
});

const Tenant = Organisation.discriminator('Tenant', schema);

module.exports = Tenant;