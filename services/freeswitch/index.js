
const config = require("../../constants/config");

const logService = require("../logger");

const createDomain = require("./domains/create");

const init = async function() {
    const metadata = {
        service: "freeswitch",
        method: "init"
    }

    logService.info("Initialising FreeSWITCH service, please wait...", metadata);

    
    logService.info("FreeSWITCH service initialised.", metadata); 
}

module.exports = { 
    createDomain,
    init
} 