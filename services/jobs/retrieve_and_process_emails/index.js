const { simpleParser } = require('mailparser');

const { onMailReceivedListener } = require("../../../events/mail_received");

const amazonService = require("../../amazon");
const logService = require("../../logger");

const updateDatabaseWithMailDetails = require("./update_database_with_mail_details");

const PARENT_JOB_NAME = "retrieve_emails";
const CHILD_JOB_NAME = "process_emails";

const defineParentJob = function(agenda) {
    agenda.define(PARENT_JOB_NAME, async job => {
        const metadata = `jobs/${ PARENT_JOB_NAME }`;

        try {
            onMailReceivedListener(({ queueDetails, storeDetails }) => {
                agenda.now(CHILD_JOB_NAME, { queueDetails, storeDetails });
            });

            amazonService.readMailsFromSqs();    
        } catch (error) {
            logService.error(error.message, metadata);            
        } 
    }, { 
        concurrency: 1,
        priority: "high"
    });
}

const defineChildJob = function(agenda) {
    agenda.define(CHILD_JOB_NAME, async job => {
        const metadata = `jobs/${ CHILD_JOB_NAME }`;

        try {
            const { queueDetails, storeDetails } = job.attrs.data;
            
            // Fetch mail from s3
            const s3Blob = await amazonService.readMailFromS3(storeDetails.key);

            // Use simple parser to read mail
            const email = await simpleParser(s3Blob);

            // Update database with mail details.
            await updateDatabaseWithMailDetails({
                 key: storeDetails.key,
                 email
            });
            
            // Delete s3 object 
            await amazonService.deleteMailFromS3(storeDetails.key);

            // Delete queue message
            await amazonService.deleteMailFromSqs(queueDetails.receiptHandle);
        } catch (error) {
            logService.error(error.message, metadata);            
        } 
    }, {
        priority: "normal"
    });
}

const init = function(agenda) {
    const metadata = "jobs/retrieve_mails";

    try {
        defineChildJob(agenda);
        defineParentJob(agenda);        
    } catch (error) {
        logService.error(error.message, metadata);        
    }
}

const run = function(agenda) {
    const metadata = `jobs/${ PARENT_JOB_NAME }/run`;

    try {
        agenda.now(PARENT_JOB_NAME);
    } catch (error) {
        logService.error(error.message, metadata);        
    }
}

module.exports = {
    init,
    run
}