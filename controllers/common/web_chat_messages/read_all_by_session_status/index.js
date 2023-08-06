const express = require('express');
const mongoose = require('mongoose');

const WebChatSession = require("../../../../models/app_web_chat_sessions");
const WebChatMessage = require('../../../../models/app_web_chat_messages');

const router = express.Router();

router.get('/webchatmessages/:status/:createdAt', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { organisationId } = req.user;
        const { status, createdAt } = req.params;

        const items = await WebChatMessage.find({
            organisation: organisationId,
            createdAt: {
                $gt: createdAt
            }
        }).populate({
            path: "session",
            match: {
                status: {
                    $bitsAnySet: status
                }
            }
        }).sort({
            createdAt: "asc"
        })
        .limit(1024)
        .session(session);

        await session.commitTransaction();

        res.json(items);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;