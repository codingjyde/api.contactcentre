const express = require('express');

const authenticate = require("../../../middleware/authenticate");

const readAllBySessionStatus = require("./read_all_by_session_status");

const router = express.Router();

router.use(authenticate);

router.use(readAllBySessionStatus);

module.exports = router;