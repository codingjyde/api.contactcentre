const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');

const Domain = require("../../../../models/app_domains");
const EmailAccount = require('../../../../models/app_channel_accounts_email_account');

const router = express.Router();

router.delete('/domains/:id', async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        const { organisationId } = req.user;

        const domain = await Domain.findOne({
            _id: id,
            organisation: organisationId
        }).session(session);
        if(!domain) {
            throw createError(400, "Invalid domain ID.");
        }

        const escapedDomain = domain.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexPattern = new RegExp(`@${ escapedDomain }$`, 'i');

        const inUse = await EmailAccount.exists({ 
            address: { 
                $regex: regexPattern 
            } 
        }).session(session);

        if(inUse) {
            throw createError(400, "You cannot delete this domain name as it is in use by at least one email account.");
        }
        
        domain.isDeleted = true;
        await domain.save(session);

        await session.commitTransaction();

        res.json(domain);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    } 
})

module.exports = router;