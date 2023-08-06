const createError = require('http-errors');
const express = require('express');

const WebChatAccount = require("../../../../models/app_channel_accounts_web_chat_account");

const router = express.Router();

router.get('/webchataccounts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organisationId } = req.user;

        const webChatAccount = await WebChatAccount.findOne({
            _id: id,
            organisation: organisationId
        });
        if(!webChatAccount) {
            throw createError(400, "Invalid web chat account ID.");
        }

        res.json(webChatAccount);
    } catch (error) {
        next(error);
    } 
})

module.exports = router;