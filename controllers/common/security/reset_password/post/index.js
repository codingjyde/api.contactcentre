const express = require('express');
const { body, validationResult } = require('express-validator');
const { readFile } = require('fs/promises');
const createError = require('http-errors');
const mongoose = require('mongoose');

const config = require("../../../../../constants/config");

const PasswordStatus = require('../../../../../constants/password_status');

const Password = require('../../../../../models/app_passwords');
const PasswordResetRequest = require('../../../../../models/app_password_reset_requests');

const cryptoService = require("../../../../../services/crypto");
const mailService = require("../../../../../services/mail");

const validators = [
    body("newPassword")
        .not().isEmpty().withMessage("Please provide your new password.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your new password cannot be longer than 64 characters.")
        .bail()
        .isStrongPassword().withMessage("Your new password should be at least 8 characters long and contain a combination of upper case "
            + "letters, lower case letters, numbers and symbols."),
];

const router = express.Router();

router.post('/resetpassword', validators, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { code, newPassword } = req.body;

        const request = await PasswordResetRequest.findOne({
            code
        }).populate("user");
        if(!request) {
            throw createError(400, "Invalid password reset request.");
        }

        const organisationId = request.user.organisationId;
        const userId = request.user._id;
        
        const passwords = await Password.find({
            user: userId,
            $or: [{ 
                status: PasswordStatus.ACTIVE
            }, { 
                status: PasswordStatus.PENDING
            }] 
        });
        for (const password of passwords) {
            password.status = PasswordStatus.OBSOLETE;
            password.save(session);
        }

        let { hash, salt } = cryptoService.hash(newPassword);

        const password = new Password({
            organisation: organisationId,
            user: userId,
            hash,
            salt,
            status: PasswordStatus.ACTIVE,
        });
        await password.save(session);

        let html = await readFile(`${ process.cwd() }/controllers/common/security/reset_password/post/templates/mail.html`);
        html = html.toString();
        html = html.replace(/{{app_name}}/g, config.APP_NAME)
            .replace(/{{first_name}}/g, request.user.firstName)
            .replace(/{{support_email}}/g, config.MAILGUN_SUPPORT_EMAIL_ADDRESS);

        await mailService.send({
            to: request.user.emailAddress, 
            subject: `Password Reset Confirmation`, 
            html
        });

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