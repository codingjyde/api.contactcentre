const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const ChannelAccountStatus = require("../../../../constants/channel_account_status");
const SocketMessages = require("../../../../constants/socket_messages");

const EmailAccount = require('../../../../models/app_channel_accounts_email_account');

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this email chat account.'),
    body('local')
        .not().isEmpty().withMessage('Please provide a valid email address for this email chat account.'),
    body('domain')
        .not().isEmpty().withMessage('Please provide a valid email address for this email chat account.'),
];

const router = express.Router();

router.post('/emailaccounts', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, local, domain } = req.body;
        const address = `${ local }${ domain }`;

        const { organisationId } = req.user;

        let exists = await EmailAccount.exists({
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await EmailAccount.exists({
            organisation: organisationId,
            address
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This address is in use already.");
        }

        const emailAccount = new EmailAccount({
            organisation: organisationId,
            name,
            address,
            status: ChannelAccountStatus.ACTIVE
        });
        await emailAccount.save(session);
        
        req.io.emit(SocketMessages.CHANNEL_ACCOUNT, emailAccount);

        await session.commitTransaction();

        res.json(emailAccount);
    } catch (error) {
        console.log(error);
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;