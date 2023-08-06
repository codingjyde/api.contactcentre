const express = require('express');
const mongoose = require('mongoose');

const ChannelAccount = require("../../../../models/app_channel_accounts");

const router = express.Router();

router.get('/channelaccounts', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        let { page, size } = req.query;
        page = page ? page : 1;
        size = size ? size : 10;

        const { organisationId } = req.user;

        const filter = {
            organisation: organisationId
        };

        const items = await ChannelAccount.find(filter)
            .sort({
                name: "asc"
            })
            .skip((page - 1) * size)
            .limit(size)
            .session(session);

        await session.commitTransaction();

        res.json({
            items
        });
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;