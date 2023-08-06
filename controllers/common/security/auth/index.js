const express = require('express');
const { body, validationResult } = require('express-validator');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');

const ConversationStatus = require("../../../../constants/conversation_status");
const SocketMessages = require('../../../../constants/socket_messages');
const WebChatMemberMode = require("../../../../constants/web_chat_member_mode");
const WebChatMemberRole = require("../../../../constants/web_chat_member_role");
const WebChatMemberStatus = require("../../../../constants/web_chat_member_status");
const WebChatMessageType = require("../../../../constants/web_chat_message_type");

const WebChatAccount = require('../../../../models/app_channel_accounts_web_chat_account');
const WebChatMessage = require('../../../../models/app_web_chat_messages');
const WebChatSession = require('../../../../models/app_web_chat_sessions');

const cryptoService = require("../../../../services/crypto");
const tokenService = require("../../../../services/token");

const validators = [
    body('clientId')
        .not().isEmpty().withMessage('Please provide the client ID of this web chat account.'),
    body('firstName')
        .not().isEmpty().withMessage('Please provide your first name.'),
    body('surname')
        .not().isEmpty().withMessage('Please provide your surname.'),
    body('emailAddress')
        .not().isEmpty().withMessage('Please provide your email address.')
        .bail()
        .isEmail().withMessage("Please provide a valid email address."),
];

const router = express.Router();

router.post('/auth', validators, async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const clientUrl = req.header('Referer');
        console.log(clientUrl);

        const { clientId, firstName, surname, emailAddress } = req.body;

        const webChatAccount = await WebChatAccount.findOne({
            clientId,
        }).populate("organisation")
        .session(session);
        if(!webChatAccount) {
            throw createHttpError(400, "This web chat account doesn't exist.");
        }

        const member = {
            _id: cryptoService.getUUID(),
            firstName,
            surname,
            emailAddress,
            dateJoined: Date.now(),
            mode: WebChatMemberMode.OVERT,
            role: WebChatMemberRole.CONTACT,
            status: WebChatMemberStatus.JOINED
        }

        const organisationId = webChatAccount.organisation._id;
        const organisationName = webChatAccount.organisation.name;

        const webChatSession = new WebChatSession({
            organisation: organisationId,
            account: webChatAccount._id,
            members: [ member],
            dateInitialised: Date.now(),
            dateUpdated: Date.now(),
            status: ConversationStatus.INITIALISED
        });
        await webChatSession.save(session);

        const webChatMessage = new WebChatMessage({
            organisation: organisationId,
            session: webChatSession._id,
            content: `Thank you for getting in touch with us at ${ organisationName }. Please wait while we assign an agent to join you.`,
            sender: {
                name: "System",
                emailAddress: ""
            },
            readReceipts: [],
            type: WebChatMessageType.SYSTEM
        });
        await webChatMessage.save(session);

        const { accessToken, refreshToken, refreshTokenExpiryDate } = await tokenService.generate({ 
            userId: 0, 
            firstName, 
            middleName: "", 
            surname, 
            emailAddress, 
            requiresPasswordChange: false, 
            organisationId, 
            organisationName,
            clientId
        });

        await session.commitTransaction();

        req.io.emit(SocketMessages.WEB_CHAT_SESSION, webChatSession);
        req.io.emit(SocketMessages.WEB_CHAT_MESSAGE, webChatMessage);

        res.status(200).json({
            session: webChatSession,
            messages: [ webChatMessage ],
            accessToken
        });    
    } catch (error) {
        await session.abortTransaction();

        next(error);
    } finally {
        session.endSession();
    }
})

module.exports = router;