const express = require('express');

const authenticate = require("../../../middleware/authenticate");

const create = require("./create");
const del = require("./delete");
const readAll = require("./read_all");
const readOne = require("./read_one");

const router = express.Router();

router.use(authenticate);

router.use(create);
router.use(del);
router.use(readAll);
router.use(readOne);

module.exports = router;