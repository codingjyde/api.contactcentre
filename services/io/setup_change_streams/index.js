const SocketMessages = require("../../../constants/socket_messages");

const { onItemDeletedListener } = require("../../../events/changes/item_deleted");
const { onItemInsertedListener } = require("../../../events/changes/item_inserted");
const { onItemUpdatedListener } = require("../../../events/changes/item_updated");

const logService = require("../../logger");

module.exports = function(io) {
    onItemDeletedListener(({ collectionName, id }) => {
        const metadata = {
            service: `io/change-stream/delete`
        };

        try {
            io.emit(SocketMessages.ITEM_DELETED, { collectionName, id });
        } catch (error) {
            logService.error(error.message, metadata);
        }
    });

    onItemInsertedListener(({ collectionName, data, id }) => {
        const metadata = {
            service: `io/change-stream/insert`
        };

        try {
            if(data.organisation) {
                const code = `${ io.roomPrefix }${ data.organisation }`;

                io.to(code)
                    .emit(SocketMessages.ITEM_INSERTED, { collectionName, data, id });
            }
        } catch (error) {
            logService.error(error.message, metadata);
        }
    });

    onItemUpdatedListener(() => {
        const metadata = {
            service: `io/change-stream/update`
        };

        try {
            if(data.organisation) {
                const code = `${ io.roomPrefix }${ data.organisation }`;

                io.to(code)
                    .emit(SocketMessages.ITEM_UPDATED, { collectionName, data, id });
            }
        } catch (error) {
            logService.error(error.message, metadata);
        }
    });
}