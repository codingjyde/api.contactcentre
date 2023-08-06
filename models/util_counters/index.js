const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    entityName: {
        index: true,
        maxLength: 64,
        required: true,
        type: String,
    },
    value: {
        index: true,
        required: true,
        type: Number,
    },
}, { 
    collection: 'util_counters'
});

const Counter = mongoose.model("Counter", schema);

module.exports = Counter;