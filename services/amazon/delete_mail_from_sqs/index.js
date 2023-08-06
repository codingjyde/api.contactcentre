const { SQSClient, DeleteMessageCommand } = require("@aws-sdk/client-sqs");

const config = require("../../../constants/config");

const logService = require("../../logger");

const sqsClient = new SQSClient({ region: config.AWS_DEFAULT_REGION }); // Replace "us-east-1" with your desired region

module.exports = async function (receiptHandle) {
    const metadata = {
        service: "amazon/delete_mail_from_sqs"
    }
    
    try {
        const params = {
            QueueUrl: config.AWS_INBOUND_EMAILS_QUEUE_URL,
            ReceiptHandle: receiptHandle,
        };
      
        await sqsClient.send(new DeleteMessageCommand(params));
    } catch (error) {
        logService.error(error.message, metadata);
    }
  }
