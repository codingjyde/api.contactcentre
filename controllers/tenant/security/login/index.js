const dayjs = require('dayjs');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { readFile } = require('fs/promises');
const createError = require('http-errors');
const mongoose = require('mongoose');

const config = require('../../../../constants/config');

const PasswordStatus = require('../../../../constants/password_status');
const TokenStatus = require('../../../../constants/token_status');
const UserStatus = require('../../../../constants/user_status');

const Password = require('../../../../models/app_passwords');
const Token = require('../../../../models/app_tokens');
const TenantUser = require('../../../../models/app_users_tenant_user');

const cryptoService = require("../../../../services/crypto");
const mailService = require("../../../../services/mail");
const tokenService = require("../../../../services/token");

const validators = [
    body("emailAddress")
        .not().isEmpty().withMessage("Please provide your email address.")
        .bail()
        .isEmail().withMessage("Please provide a valid email address.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your email address cannot be more than 64 characters."),
    body("password")
        .not().isEmpty().withMessage("Please provide your password.")
        .bail()
        .isLength({ max: 64 }).withMessage("Your password cannot be more than 64 characters."),
];

const router = express.Router();

router.post('/login', validators, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { emailAddress, password } = req.body;

        const user = await TenantUser.findOne({
            emailAddress
        }).populate("organisation")
        .session(session);
        if(!user) {
            throw createError(400, "Invalid login.");
        }

        const userId = user._id;
        const organisationId = user.organisation._id;

        const passwords = await Password.find({
            user: userId,
            $or: [{ 
                status: PasswordStatus.ACTIVE
            }, { 
                status: PasswordStatus.PENDING
            }] 
        }).session(session);
        if(passwords.length === 0) {
            throw createError(400, "Invalid login.");
        }

        const pword = passwords.find(x => cryptoService.verifyHash(password, x.salt, x.hash));
        if(!pword) {
            throw createError(400, "Invalid login.");
        }

        if(user.status === UserStatus.SUSPENDED) {
            throw createError(400, "Your account has been suspended.");
        }

        const { accessToken, refreshToken, refreshTokenExpiryDate } = await tokenService.generate({ 
            userId: userId, 
            firstName: user.firstName, 
            middleName: user.middleName, 
            surname: user.surname, 
            emailAddress: user.emailAddress, 
            requiresPasswordChange: user.requiresPasswordChange, 
            organisationId, 
            organisationName: user.organisation.name 
        });

        const { hash, salt } = cryptoService.hash(refreshToken);

        const token = new Token({ 
            organisation: organisationId, 
            user: userId,
            hash,
            salt,
            expiryDate: refreshTokenExpiryDate,
            status: TokenStatus.ACTIVE
        });
        await token.save(session);

        let html = await readFile(`${ process.cwd() }/controllers/tenant/security/login/templates/mail.html`);
        html = html.toString();
        html = html.replace(/{{app_name}}/g, config.APP_NAME)
            .replace(/{{date}}/g, dayjs().format("D MMM YYYY"))
            .replace(/{{first_name}}/g, user.firstName)
            .replace(/{{support_email}}/g, config.MAILGUN_SUPPORT_EMAIL_ADDRESS)
            .replace(/{{time}}/g, dayjs().format("h:mm:ss a"));

        await mailService.send({
            to: emailAddress, 
            subject: `Login Activity Alert`, 
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