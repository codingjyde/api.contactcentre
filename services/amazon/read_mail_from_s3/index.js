const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const config = require("../../../constants/config");

const logService = require("../../../services/logger");

module.exports = async function(key) {
    const metadata = "amazon/read_mail_from_s3";

    try {
        const s3Client = new S3Client({ region: config.AWS_DEFAULT_REGION }); 
        
        const params = {
            Bucket: config.AWS_INBOUND_EMAILS_BUCKET_NAME,
            Key: key,
        };

        const response = await s3Client.send(new GetObjectCommand(params));

        return response.Body;

    } catch (error) {
        logService.error(error.message, metadata)
    }
}