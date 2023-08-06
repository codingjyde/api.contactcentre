const express = require('express');

const auth = require("../../common/security/auth");
const changePassword = require("../../common/security/change_password");
const forgotPassword = require("../../common/security/forgot_password");
const login = require("./login");
const refresh = require("../../common/security/refresh");
const register = require("./register");
const resetpassword = require("../../common/security/reset_password");

const router = express.Router();

router.use(auth);
router.use(forgotPassword);
router.use(login);
router.use(refresh);
router.use(register);
router.use(resetpassword);
router.use(changePassword);

module.exports = router;