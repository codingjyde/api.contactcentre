const cors = require('cors');

const config = require("../../constants/config");

module.exports = function() {    
    const options = {
        origin: "*", //config.APP_CLIENT_ORIGINS,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }

    return cors(options);
}