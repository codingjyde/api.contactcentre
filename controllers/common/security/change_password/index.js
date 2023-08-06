const dayjs = require('dayjs');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { readFile } = require('fs/promises');
const createError = require('http-errors');
const mongoose = require('mongoose');

const config = require("../../../../constants/config");

const PasswordStatus = require('../../../../constants/password_status');
const TokenStatus = require("../../../../constants/token_status");

const Password = require('../../../../models/app_passwords');
const Token = require('../../../../models/app_tokens');
const User = require('../../../../models/app_users');

const authenticate = require("../../../../middleware/authenticate");

const cryptoService = require("../../../../services/crypto");
const mailService = require("../../../../services/mail");
const tokenService = require("../../../../services/token");

const validators = [
    body("currentPassword")
        .not().isEmpty().withMessage("Please provide your current password.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your current password cannot be longer than 64 characters."),
    body("newPassword")
        .not().isEmpty().withMessage("Please provide your new password.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your new password cannot be longer than 64 characters.")
        .bail()
        .isStrongPassword().withMessage("Your new password should be at least 8 characters long and contain a combination of upper case "
            + "letters, lower case letters, numbers and symbols."),
];

const router = express.Router();

router.post('/changepassword', validators, authenticate, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const { organisationId, userId } = req.user;

        const user = await User.findOne({
            _id: userId,
            organisation: organisationId
        }).populate("organisation")
        .session(session);
        if(!user) {
            throw createError(400, "Invalid user.");
        };

        const passwords = await Password.find({
            user: userId,
            $or: [{ 
                status: PasswordStatus.ACTIVE
            }, { 
                status: PasswordStatus.PENDING
            }] 
        }).session(session);
        if(passwords.length === 0) {
            throw createError(400, "Invalid current password.");
        }

        let password = passwords.find(x => cryptoService.verifyHash(currentPassword, x.salt, x.hash));
        if(!password) {
            throw createError(400, "Invalid current password.");
        }

        password.status = PasswordStatus.OBSOLETE;
        await password.save(session);

        user.requiresPasswordChange = false;
        await user.save(session);

        let data = cryptoService.hash(newPassword);

        password = new Password({
            organisation: organisationId,
            user: userId,
            hash: data.hash,
            salt: data.salt,
            status: PasswordStatus.ACTIVE,
        });
        await password.save(session);

        const { accessToken, refreshToken, refreshTokenExpiryDate } = await tokenService.generate({
            userId, 
            firstName: user.firstName, 
            middleName: user.middleName, 
            surname: user.surname, 
            emailAddress: user.emailAddress, 
            requiresPasswordChange: user.requiresPasswordChange, 
            organisationId, 
            organisationName: user.organisation.name 
        });

        data = cryptoService.hash(refreshToken);

        const token = new Token({
            organisation: organisationId, 
            user: userId,
            hash: data.hash,
            salt: data.salt,
            expiryDate: refreshTokenExpiryDate,
            status: TokenStatus.ACTIVE
        });
        await token.save(session);

        let html = await readFile(`${ process.cwd() }/controllers/common/security/change_password/templates/mail.html`);
        html = html.toString();
        html = html.replace(/{{app_name}}/g, config.APP_NAME)
            .replace(/{{date}}/g, dayjs().format("D MMM YYYY"))
            .replace(/{{first_name}}/g, user.firstName)
            .replace(/{{support_email}}/g, config.MAILGUN_SUPPORT_EMAIL_ADDRESS)
            .replace(/{{time}}/g, dayjs().format("h:mm:ss a"));

        await mailService.send({
            to: user.emailAddress, 
            subject: `Password Change Confirmation`, 
            html
        });

        await session.commitTransaction();

        res.status(200).json({ 
            accessToken, 
            refreshToken 
        });
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = router;