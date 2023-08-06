const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const ChannelAccountStatus = require("../../../../constants/channel_account_status");
const SocketMessages = require("../../../../constants/socket_messages");

const WebChatAccount = require('../../../../models/app_channel_accounts_web_chat_account');

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this web chat account.'),
    body('url')
        .not().isEmpty().withMessage('Please provide the url of this web chat account.')
        .isURL().withMessage("Please provide a valid url for this web chat account."),
];

const router = express.Router();

router.post('/webchataccounts', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, url } = req.body;

        const { organisationId } = req.user;

        let exists = await WebChatAccount.exists({
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await WebChatAccount.exists({
            organisation: organisationId,
            url
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This url is in use already.");
        }

        const webChatAccount = new WebChatAccount({
            organisation: organisationId,
            name,
            url,
            status: ChannelAccountStatus.ACTIVE
        });
        await webChatAccount.save(session);
        
        req.io.emit(SocketMessages.WEB_CHAT_ACCOUNT, webChatAccount);

        await session.commitTransaction();

        res.json(webChatAccount);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;