const express = require('express');
const { body, validationResult } = require('express-validator');
const { readFile } = require('fs/promises');
const createError = require('http-errors');
const mongoose = require('mongoose');

const config = require("../../../../constants/config");

const OrganisationStatus = require("../../../../constants/organisation_status");
const PasswordStatus = require("../../../../constants/password_status");
const TokenStatus = require("../../../../constants/token_status");
const UserStatus = require("../../../../constants/user_status");

const Password = require("../../../../models/app_passwords");
const Tenant = require('../../../../models/app_organisations_tenant');
const TenantUser = require('../../../../models/app_users_tenant_user');
const Token = require("../../../../models/app_tokens");
const User = require('../../../../models/app_users');

const cryptoService = require("../../../../services/crypto");
const mailService = require("../../../../services/mail");
const tokenService = require("../../../../services/token");

const validators = [ 
    body("name")
        .not().isEmpty().withMessage("Please provide the name of the organisation to register.")
        .bail()
        .isLength({ max: 64 }).withMessage("The name of the organisation cannot be more than 64 characters."),
    body("firstName")
        .not().isEmpty().withMessage("Please provide the first name of the user.")
        .bail()
        .isLength({ max: 64 }).withMessage("The first name of the user cannot be more than 64 characters."),
    body("middleName")
        .isLength({ max: 64 }).withMessage("The middle name of the user cannot be more than 64 characters."),
    body("surname")
        .not().isEmpty().withMessage("Please provide the surname of the user.")
        .bail()
        .isLength({ max: 64 }).withMessage("The surname of the user cannot be more than 64 characters."),
    body("emailAddress")
        .not().isEmpty().withMessage("Please provide the email address of the user.")
        .bail()
        .isEmail().withMessage("Please provide a valid email address.")
        .bail()
        .isLength({ max: 64 }).withMessage("The email address of the user cannot be more than 64 characters."),
];

const router = express.Router();

router.post('/register', validators, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, firstName, middleName, surname, emailAddress } = req.body;

        const exists = await User.exists({ 
            emailAddress
        });
        if(exists) {
            throw createError(400, `The email address - ${ emailAddress } - is already in use.`);
        }

        const tenant = new Tenant({
            name,
            status: OrganisationStatus.ACTIVE
        });
        await tenant.save(session); 

        const organisationId = tenant._id;

        console.log("organisationId", organisationId);
        
        const user = new TenantUser({
            organisation: organisationId,
            firstName,
            middleName,
            surname,
            emailAddress,
            requiresPasswordChange: true,
            status: UserStatus.ACTIVE
        });
        await user.save(session);

        const userId = user._id;
        
        const input = cryptoService.getRandomString(10);
        let data = cryptoService.hash(input);

        const password = new Password({
            organisation: organisationId,
            user: userId,
            hash: data.hash,
            salt: data.salt,
            status: PasswordStatus.PENDING,
        });
        await password.save(session);

        const { accessToken, refreshToken, refreshTokenExpiryDate } = await tokenService.generate({ 
            userId: userId, 
            firstName: user.firstName, 
            middleName: user.middleName, 
            surname: user.surname, 
            emailAddress: user.emailAddress, 
            requiresPasswordChange: user.requiresPasswordChange, 
            organisationId, 
            organisationName: tenant.name 
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

        let html = await readFile(`${ process.cwd() }/controllers/tenant/security/register/templates/mail.html`);
        html = html.toString();
        html = html.replace(/{{app_name}}/g, config.APP_NAME)
            .replace(/{{first_name}}/g, firstName)
            .replace(/{{password}}/g, input);

        await mailService.send({
            to: emailAddress, 
            subject: `Welcome to ${ config.APP_NAME }!`, 
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