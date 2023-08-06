const express = require('express');

const authenticate = require("../../../middleware/authenticate");

const create = require("./create");
const del = require("./delete");
const readAll = require("./read_all");
const readAllByStatus = require("./read_all_by_status");
const readOne = require("./read_one");
const verify = require("./verify");

const router = express.Router();

router.use(authenticate);

router.use(create);
router.use(del);
router.use(readAll);
router.use(readAllByStatus);
router.use(readOne);
router.use(verify);

module.exports = router;