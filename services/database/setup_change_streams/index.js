const { emitItemDeletedEvent } = require("../../../events/changes/item_deleted");
const { emitItemInsertedEvent } = require("../../../events/changes/item_inserted");
const { emitItemUpdatedEvent } = require("../../../events/changes/item_updated");

const logService = require("../../logger");

module.exports = async function(collection) {
    const metadata = {
        service: `database/change-stream/${ collection.name }`
    };

    try {
        const changeStream = collection.watch();
  
        changeStream.on('change', (change) => {
            console.log(change);
            switch (change.operationType) {
                case "insert":
                    emitItemInsertedEvent({
                        collectionName: change.ns.coll,
                        data: change.fullDocument,
                        id: change.documentKey._id
                    });
                    break;
                case "update":
                    emitItemUpdatedEvent({
                        collectionName: change.ns.coll,
                        data: change.fullDocument,
                        id: change.documentKey._id
                    });
                    break;
                case "delete":
                    emitItemDeletedEvent({
                        collectionName: change.ns.coll,
                        id: change.documentKey._id
                    })
                    break;
            }
        });
    } catch (error) {
        logService.error(error.message, metadata);
    }
}