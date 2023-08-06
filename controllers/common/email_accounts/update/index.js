const createError = require("http-errors");
const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const ChannelAccountStatus = require('../../../../constants/channel_account_status');

const EmailAccount = require('../../../../models/app_channel_accounts_email_account');

const validators = [
    body('name')
        .not().isEmpty().withMessage('Please provide the name of this email account.'),
    body('address')
        .not().isEmpty().withMessage('Please provide the address of this email account.')
        .isEmail().withMessage("Please provide a valid address for this email account."),
    body('status')
        .not().isEmpty()
            .withMessage('Please provide the status of this email account.')
        .isIn([ ChannelAccountStatus.ACTIVE, ChannelAccountStatus.SUSPENDED])
            .withMessage(`The status of this email account should be suspended(${ ChannelAccountStatus.SUSPENDED }) or active(${ ChannelAccountStatus.ACTIVE }). `),
];

const router = express.Router();

router.put('/emailaccounts/:id', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { name, address, status } = req.body;
        let { id } = req.params;

        const { organisationId } = req.user;

        let exists = await EmailAccount.exists({
            _id: { $ne: id },
            organisation: organisationId,
            name
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This name is in use already.");
        }

        exists = await EmailAccount.exists({
            _id: { $ne: id },
            organisation: organisationId,
            address
        }, {
            session
        });
        if(exists) {
            throw createHttpError(400, "This address is in use already.");
        }

        const emailAccount = await EmailAccount.findOne({
            _id: id,
            organisation: organisationId,
        }).session(session);
        if(!emailAccount) {
            throw createError(400, "Invalid email account ID.");
        }

        emailAccount.name = name;        
        emailAccount.address = address;        
        emailAccount.status = parseInt(status);
        
        await emailAccount.save(session);
        
        await session.commitTransaction();

        req.io.emit(SocketMessages.CHANNEL_ACCOUNT, emailAccount);

        res.json(emailAccount);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;