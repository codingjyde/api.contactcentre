const createError = require('http-errors');
const express = require('express');

const EmailAccount = require("../../../../models/app_channel_accounts_email_account");

const router = express.Router();

router.get('/emailaccounts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { organisationId } = req.user;

        const emailAccount = await EmailAccount.findOne({
            _id: id,
            organisation: organisationId
        });
        if(!emailAccount) {
            throw createError(400, "Invalid email chat account ID.");
        }

        res.json(emailAccount);
    } catch (error) {
        next(error);
    } 
})

module.exports = router;