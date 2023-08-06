const dayjs = require('dayjs');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { readFile } = require('fs/promises');
const createError = require('http-errors');
const mongoose = require('mongoose');

const config = require('../../../../constants/config');

const PasswordResetRequestStatus = require('../../../../constants/password_reset_request_status');
const UserStatus = require('../../../../constants/user_status');

const PasswordResetRequest = require("../../../../models/app_password_reset_requests");
const User = require('../../../../models/app_users');

const cryptoService = require("../../../../services/crypto");
const logService = require("../../../../services/logger");
const mailService = require("../../../../services/mail");

const validators = [
    body("emailAddress")
        .not().isEmpty().withMessage("Please provide your email address.")
        .bail()
        .isEmail().withMessage("Please provide a valid email address.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your email address cannot be more than 64 characters."),
    body("origin")
        .not().isEmpty().withMessage("Please provide the origin of your web application.")
        .bail()
        .isLength({ max: 255 }).withMessage("Your origin cannot be more than 255 characters."),
];

const router = express.Router();

router.post('/forgotpassword', validators, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { emailAddress, origin } = req.body;

        const user = await User.findOne({
            emailAddress
        });

        if(user && (user.status === UserStatus.ACTIVE)) {
            const request = new PasswordResetRequest({
                organisation: user.organisation,
                user: user._id,
                code: cryptoService.getRandomString(32),
                expiryDate: dayjs().add(1, "hour").valueOf(),
                status: PasswordResetRequestStatus.PENDING
            });
            await request.save(session);
        
            let html = await readFile(`${ process.cwd() }/controllers/common/security/forgot_password/templates/mail.html`);
            html = html.toString();
            html = html.replace(/{{app_name}}/g, config.APP_NAME)
                .replace(/{{first_name}}/g, user.firstName)
                .replace(/{{password_reset_link}}/g, `${ origin }/${ request.code }`)
                .replace(/{{support_email}}/g, config.MAILGUN_SUPPORT_EMAIL_ADDRESS)
                .replace(/{{timespan}}/g, "60 minutes");
    
            await mailService.send({
                to: emailAddress, 
                subject: `Password Reset Request Confirmation`, 
                html
            });    
        } else {
            req.logger.info(`Invalid password reset request.`, {
                controller: "security",
                action: "forgotpassword",
                emailAddress
            });
        }

        await session.commitTransaction();

        res.status(200).json();
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = router;