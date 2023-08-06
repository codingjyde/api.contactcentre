const express = require('express');

const authenticate = require("../../../middleware/authenticate");

const readAllByStatus = require("./read_all_by_status");

const router = express.Router();

router.use(authenticate);

router.use(readAllByStatus);

module.exports = router;