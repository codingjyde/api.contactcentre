const express = require('express');

const router = express.Router();

const get = require("./get");
const post = require("./post");

router.use(get);
router.use(post);

module.exports = router;