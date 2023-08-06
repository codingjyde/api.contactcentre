const { SQSClient, ReceiveMessageCommand } = require("@aws-sdk/client-sqs");

const config = require("../../../constants/config");

const { emitMailReceivedEvent } = require("../../../events/mail_received");

const logService = require("../../logger");

const sqsClient = new SQSClient({ region: config.AWS_DEFAULT_REGION }); 

const params = {
    QueueUrl: config.AWS_INBOUND_EMAILS_QUEUE_URL,
    MaxNumberOfMessages: 10, // Maximum number of messages to receive in one request
    WaitTimeSeconds: 20
};

const metadata = {
    service: "amazon/getEmails"
}

const run = async function() {
    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        if(data.Messages) {
            for (const message of data.Messages) {
                const queueDetails = {
                    messageId: message.MessageId,
                    receiptHandle: message.ReceiptHandle,
                }
                
                const records = JSON.parse(message.Body).Records;

                for (const record of records) {
                    const storeDetails = {
                        key: record.s3.object.key,
                        size: record.s3.object.size
                    }
                    
                    emitMailReceivedEvent({ queueDetails, storeDetails });    
                }
            }
        }
    } catch (error) {
        logService.error(error.message, metadata);
    } finally {
        run();
    }
}

module.exports = function() {
    run();
}