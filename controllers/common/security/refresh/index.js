const express = require('express');
const { body, validationResult } = require('express-validator');
const createError = require('http-errors');
const mongoose = require('mongoose');

const UserStatus = require('../../../../constants/user_status');
const TokenStatus = require('../../../../constants/token_status');

const Token = require('../../../../models/app_tokens');
const User = require('../../../../models/app_users');

const cryptoService = require("../../../../services/crypto");
const tokenService = require("../../../../services/token");

const validators = [
    body("token")
        .not().isEmpty().withMessage("Please provide a refresh token.")
        .bail()
        .isJWT().withMessage("Please provide a valid refresh token.")
];

const router = express.Router();

router.post('/refresh/:userId', validators, async function(req, res, next) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.body;
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate("organisation");
        if(!user) {
            throw createError(400, "Invalid user ID.");
        }
        
        if(user.status === UserStatus.SUSPENDED) {
            throw createError(400, "Your account has been suspended.");
        }

        const organisationId = user.organisation._id;

        const tokens = await Token.find({
            user: userId,
            status: TokenStatus.ACTIVE
        });
        let t = tokens.find(x => cryptoService.verifyHash(token, x.salt, x.hash));
        if(!t) {
            throw createError(400, "Invalid token.");
        }

        await tokenService.verifyRefreshToken(token);
        
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
        
        const { hash, salt} = cryptoService.hash(refreshToken);

        t = new Token({ 
            organisation: organisationId,
            user: userId,
            hash,
            salt,
            expiryDate: refreshTokenExpiryDate,
            status: TokenStatus.ACTIVE
        });
        await t.save(session);

        await session.commitTransaction();

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
});

module.exports = router;