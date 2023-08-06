const createError = require("http-errors");
const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const ChannelAccountStatus = require('../../../../constants/channel_account_status');

const WebChatAccount = require('../../../../models/app_channel_accounts_web_chat_account');

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this web chat account.'),
    body('url')
        .not().isEmpty().withMessage('Please provide the url of this web chat account.')
        .isURL().withMessage("Please provide a valid url for this web chat account."),
    body('status')
        .not().isEmpty()
            .withMessage('Please provide the status of this web chat account.')
        .isIn([ ChannelAccountStatus.ACTIVE, ChannelAccountStatus.SUSPENDED])
            .withMessage(`The status of this web chat account should be suspended(${ ChannelAccountStatus.SUSPENDED }) or active(${ ChannelAccountStatus.ACTIVE }). `),
];

const router = express.Router();

router.put('/webchataccounts/:id', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, url, status } = req.body;
        let { id } = req.params;

        const { organisationId } = req.user;

        let exists = await WebChatAccount.exists({
            _id: { $ne: id },
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await WebChatAccount.exists({
            _id: { $ne: id },
            organisation: organisationId,
            url
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This url is in use already.");
        }

        console.log(id);

        const webChatAccount = await WebChatAccount.findOne({
            _id: id,
            organisation: organisationId,
        }).session(session);
        if(!webChatAccount) {
            throw createError(400, "Invalid web chat account ID.");
        }

        webChatAccount.name = name;        
        webChatAccount.url = url;        
        webChatAccount.status = parseInt(status);
        
        await webChatAccount.save(session);
        
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