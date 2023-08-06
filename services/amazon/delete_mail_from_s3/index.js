const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const config = require("../../../constants/config");

const logService = require("../../logger");

const s3Client = new S3Client({ region: config.AWS_DEFAULT_REGION }); // Replace "us-east-1" with your desired region

module.exports = async function(key) {
    const metadata = {
        service: "amazon/delete_mail_from_s3"
    }
    
    try {
        const params = {
            Bucket: config.AWS_INBOUND_EMAILS_BUCKET_NAME,
            Key: key,
        };
      
        await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
        logService.error(error.message, metadata);
    }
}