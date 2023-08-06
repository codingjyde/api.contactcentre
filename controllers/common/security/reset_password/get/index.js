const dayjs = require("dayjs");
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');

const PasswordResetRequestStatus = require("../../../../../constants/password_reset_request_status");

const PasswordResetRequest = require('../../../../../models/app_password_reset_requests');

dayjs.extend(isSameOrAfter);

const router = express.Router();

router.get('/resetpassword/:code', async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { code } = req.params;

        const request = await PasswordResetRequest.findOne({
            code
        }).populate("user");
        if(!request) {
            throw createError(400, "Invalid password reset request.");
        }

        if(request.status === PasswordResetRequestStatus.PENDING) {
            // Has this request expired?
            if(dayjs().isSameOrAfter(dayjs(request.expiryDate))) {
                request.status = PasswordResetRequestStatus.EXPIRED;
                await request.save(session);
            }
        }

        await session.commitTransaction();

        res.status(200).json(request);
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = router;