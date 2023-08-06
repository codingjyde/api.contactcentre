const logService = require("../../services/logger");

module.exports = async function(req, res, next) {
    req.logger = logService;

    next(); 
}