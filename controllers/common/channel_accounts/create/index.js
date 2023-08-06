const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const Channel = require("../../../../constants/channel");
const ChannelAccountStatus = require("../../../../constants/channel_account_status");
const SocketMessages = require("../../../../constants/socket_messages");

const ChannelAccount = require('../../../../models/app_channel_accounts');

const cryptoService = require("../../../../services/crypto");

const CLIENT_ID_LENGTH = 20;

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this channel account.'),
    body('data')
        .not().isEmpty().withMessage('Please provide data for this channel account.'),
    body('type')
        .not().isEmpty().withMessage('Please provide the type of this channel account.')
        .isIn([ Channel.EMAIL, Channel.TELEPHONY, Channel.WEB_CHAT ])
            .withMessage(`The type for this channel account should be one of email(${ Channel.EMAIL}), web chat(${ Channel.WEB_CHAT }) or telephony(${ Channel.TELEPHONY}).`),
];

const router = express.Router();

router.post('/channelaccounts', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, data, type } = req.body;
        const { organisationId } = req.user;


        const exists = await ChannelAccount.exists({
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        switch (type) {
            case Channel.EMAIL:
                if(!data.address) {
                    throw createHttpError(400, "Please provide a valid email address.");            
                }
                break;
            case Channel.WEB_CHAT:
                if(!data.url) {
                    throw createHttpError(400, "Please provide a valid url.");            
                }
                data.clientId = cryptoService.getRandomString(CLIENT_ID_LENGTH) 
                break;
            default:
                break;
        }

        const channelAccount = new ChannelAccount({
            organisation: organisationId,
            name,
            data,
            type,
            status: ChannelAccountStatus.ACTIVE
        });
        await channelAccount.save(session);
        
        req.io.emit(SocketMessages.CHANNEL_ACCOUNT, channelAccount);

        await session.commitTransaction();

        res.json(channelAccount);
    } catch (error) {
        console.log(error);
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;