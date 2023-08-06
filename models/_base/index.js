const Counter = require("../util_counters");

const cryptoService = require("../../services/crypto");

const middlewareItems = [
    "count",
    "countDocuments",
    "deleteMany",
    "deleteOne",
    "estimatedDocumentCount",
    "find",
    "findOne",
    "findOneAndDelete",
    "findOneAndRemove",
    "findOneAndReplace",
    "findOneAndUpdate",
    "remove",
    "replaceOne",
    "update",
    "updateOne",
    "updateMany"
];

module.exports = function basePlugin(schema, options) {
    schema.add({
        _id: {
            default: function() {
                return cryptoService.getUUID();
            }, 
            type: String,
        },
        isDeleted: {
            default: false, 
            required: true,
            type: Boolean,
        },
        createdAt: Number,
        updatedAt: Number, 
    });

    //schema.set("strict", false);
 
    schema.set("timestamps", {
        currentTime: () => Date.now()
    });

    schema.set("toJSON", {
        transform: function (doc, ret) {
            ret.id = ret._id;
            
            delete ret._id;
            delete ret.isDeleted;
            delete ret.__v;
        }
    });

    for (const item of middlewareItems) {
        schema.pre(item, function() {
            const self = this;

            self.where({ 
                isDeleted: false 
            });
        });    
    }

    // schema.pre('save', async function() {
    //     if (!this._id) {
    //         const counter = await Counter.findOneAndUpdate({
    //             entityName: options.entityName
    //         }, {
    //             $inc:{
    //                 value: 1
    //             }
    //         }, {
    //             new: true,
    //             upsert: true
    //         });

    //         this._id = counter.value;
    //     }
    // });
}