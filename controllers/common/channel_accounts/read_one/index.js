const createError = require('http-errors');
const express = require('express');

const ChannelAccount = require("../../../../models/app_channel_accounts");

const router = express.Router();

router.get('/channelaccounts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organisationId } = req.user;

        const channelAccount = await ChannelAccount.findOne({
            _id: id,
            organisation: organisationId
        });
        if(!channelAccount) {
            throw createError(400, "Invalid channel account ID.");
        }

        res.json(channelAccount);
    } catch (error) {
        next(error);
    } 
})

module.exports = router;