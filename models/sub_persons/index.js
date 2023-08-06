const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        index: true,
        trim: true,
        type: String,
    },
    emailAddress: {
        index: true,
        trim: true,
        type: String,
    }
});

module.exports = schema;