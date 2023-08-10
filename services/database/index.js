const mongoose = require('mongoose');

const config = require("../../constants/config");

const ChannelAccount = require("../../models/app_channel_accounts");
const Contact = require("../../models/app_contacts");
const ContactAccount = require("../../models/app_contact_accounts");
const Conversation = require("../../models/app_conversations");
const ConversationItem = require("../../models/app_conversation_items");
const Counter = require('../../models/util_counters');
const Domain = require('../../models/app_domains');
const EmailMessage = require('../../models/app_email_messages');
const Label = require('../../models/app_labels');
const Organisation = require('../../models/app_organisations');
const Password = require('../../models/app_passwords');
const Token = require("../../models/app_tokens");
const User = require('../../models/app_users');
//const WebChatAccount = require("../../models/app_channel_accounts_web_chat_account");
const WebChatMessage = require("../../models/app_web_chat_messages");
const WebChatSession = require("../../models/app_web_chat_sessions");

const logService = require("../logger/index");

const setupChangeStreams = require("./setup_change_streams");

const metadata = {
    service: "database"
}

const handleEvents = function() {
    mongoose.connection.on("connecting", () => {
        logService.info("Connecting to database, please wait...", metadata);
    });

    mongoose.connection.on("connected", () => {
        logService.info("Connected to database.", metadata);
    });

    mongoose.connection.on("open", () => {
        logService.info("Database connection opened.", metadata);
    });

    mongoose.connection.on("disconnecting", () => {
        logService.info("Disconnecting from database, please wait...", metadata);
    });

    mongoose.connection.on("disconnected", () => {
        logService.info("Disconnected from database.", metadata);
    });

    mongoose.connection.on("close", () => {
        logService.info("Database connection closed.", metadata);
    });

    mongoose.connection.on("reconnected", () => {
        logService.info("Reconnected to database.", metadata);
    });

    mongoose.connection.on("fullsetup", () => {
        logService.info("Connected to primary database server and at least one secondary database server.", metadata);
    });

    mongoose.connection.on("all", () => {
        logService.info("Connected to all database servers.", metadata);
    });

    mongoose.connection.on('error', error => {
        logService.error(error.message, metadata);
    });
}

const init = async function() {
    try {
        logService.info("Initialising database service, please wait...", metadata);
    
        mongoose.set('strictQuery', true);

        handleEvents();

        console.log(config.MONGODB_CONNECTION_STRING);

        const connection = await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        ChannelAccount.createCollection();
        setupChangeStreams(ChannelAccount);

        console.log("ChannelAccount collection created.");
        console.log();

        Contact.createCollection();
        setupChangeStreams(Contact);

        ContactAccount.createCollection();
        setupChangeStreams(ContactAccount);

        Conversation.createCollection();
        setupChangeStreams(Conversation);

        ConversationItem.createCollection();
        setupChangeStreams(ConversationItem);

        Counter.createCollection();
        
        Domain.createCollection();
        setupChangeStreams(Domain);

        EmailMessage.createCollection();
        setupChangeStreams(EmailMessage);

        Label.createCollection();
        setupChangeStreams(Label);

        Organisation.createCollection();
        setupChangeStreams(Organisation);

        Password.createCollection();
        //setupChangeStreams(Password);

        Token.createCollection();
        //setupChangeStreams(Token);

        User.createCollection();
        setupChangeStreams(User);

        WebChatMessage.createCollection();
        setupChangeStreams(WebChatMessage);

        WebChatSession.createCollection();
        setupChangeStreams(WebChatSession);

        
        logService.info("Database service initialised.", metadata);    
    } catch (error) {
        logService.error(error.message, metadata);
    }
}

module.exports = {
    init,
}