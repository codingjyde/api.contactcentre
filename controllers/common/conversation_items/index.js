const express = require('express');

const authenticate = require("../../../middleware/authenticate");

const readAllByConversationStatus = require("./read_all_by_conversation_status");

const router = express.Router();

router.use(authenticate);

router.use(readAllByConversationStatus);

module.exports = router;