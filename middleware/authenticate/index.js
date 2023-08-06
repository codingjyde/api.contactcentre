const logService = require("../../services/logger");
const tokenService = require("../../services/token");

module.exports = async function(req, res, next) {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(!token)
    {
        return res.sendStatus(401);   
    }

    try {
        req.user = await tokenService.verifyAccessToken(token);
  
        next();  
    } catch (error) {
        logService.error({
            message: error.message,
            metadata: {
                middleware: "authenticate"
            }
        });
        
        return res.sendStatus(403);
    }
}