const mongoose = require('mongoose');

const SocketMessages = require("../../../constants/socket_messages");
const SocketRooms = require("../../../constants/socket_rooms");

const WebChatMessage = require('../../../models/app_web_chat_messages');

const cryptoService = require("../../crypto");
const logService = require("../../logger");


const metadata = {
    service: "io/web_chat_message"
}

const init = function(io) {
    io.on('connection', (socket) => {
        socket.on(SocketMessages.WEB_CHAT_MESSAGE, async (data) => {
            const session = await mongoose.startSession();

            try {
                session.startTransaction();

                const { organisationId, sessionId, messageId, content, type } = data;
                const { name, emailAddress } = data.sender;

                const webChatMessage = new WebChatMessage({
                    _id: messageId,
                    organisation: organisationId,
                    session: sessionId,
                    content,
                    sender: {
                        name,
                        emailAddress
                    },
                    readReceipts: [],
                    type
                });
                await webChatMessage.save(session);

                await session.commitTransaction();

                // Send this message to everyone subscribed to receive web chat messages.
                io.emit(SocketMessages.WEB_CHAT_MESSAGE, webChatMessage);
            } catch (error) {
                logService.error(error, metadata);

                await session.abortTransaction();
            } finally {
                session.endSession();
            }
        });
    });
}

// WillieWonka1983

module.exports = { init }