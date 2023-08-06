const express = require('express');

const labels = require("../common/labels");

const router = express.Router();

router.use(labels);

module.exports = router;