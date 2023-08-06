const express = require('express');

const channelAccounts = require("../common/channel_accounts");
const conversationItems = require("../common/conversation_items");
const conversations = require("../common/conversations");
const domains = require("../common/domains");
const labels = require("../common/labels");
const security = require("./security");
const webChatAccounts = require("../common/web_chat_accounts");
const webChatMessages = require("../common/web_chat_messages");
const webChatSessions = require("../common/web_chat_sessions");

const router = express.Router();

router.use(security);
router.use(channelAccounts);
router.use(conversationItems);
router.use(conversations);
router.use(domains);
router.use(labels);
router.use(webChatAccounts);
router.use(webChatMessages);
router.use(webChatSessions);

module.exports = router;