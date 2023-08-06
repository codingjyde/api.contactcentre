const { Agenda } = require("@hokify/agenda");

const config = require("../../constants/config");

const logService = require("../logger");

const retrieveAndProcessEmails = require("./retrieve_and_process_emails");

const metadata = {
    service: "jobs"
}

const init = async function() {
    try {
        logService.info("Initialising jobs service, please wait...");

        const agenda = new Agenda({ 
            db: { 
                address: config.MONGODB_CONNECTION_STRING ,
                collection: "agenda_jobs"
            } 
        });
        
        agenda.on("error", function(error) {
            logService.error(error.message, metadata);                
        });

        agenda.on("ready", async function() {
            try {
                logService.info("Agenda is ready!", metadata);
        
                retrieveAndProcessEmails.init(agenda);

                await agenda.start();

                if(config.JOBS_RUN_RETRIEVE_AND_PROCESS_EMAILS) {
                    retrieveAndProcessEmails.run(agenda);
                }
                
            } catch (error) {
                logService.error(error.message, metadata);                
            }
        });

        logService.info("Jobs service initialised.");
    } catch (error) {
        logService.error(error.message, metadata);
    }
}

module.exports = {
    init
}