const { S3Client, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { SESClient, GetIdentityVerificationAttributesCommand, SendEmailCommand, VerifyDomainIdentityCommand, VerifyEmailAddressCommand } = require("@aws-sdk/client-ses");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

const config = require("../../constants/config");
const DnsRecordType = require("../../constants/dns_record_type");

const REGION = config.AWS_DEFAULT_REGION;
const credentials = {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
};
  
const s3Client = new S3Client({ region: REGION, credentials });
const sesClient = new SESClient({ region: REGION, credentials });
const stsClient = new STSClient({ region: REGION, credentials });

const deleteMailFromS3 = require("./delete_mail_from_s3");
const deleteMailFromSqs = require("./delete_mail_from_sqs");
const readMailFromS3 = require("./read_mail_from_s3");
const readMailsFromSqs = require("./read_mails_from_sqs");



const checkDomainVerificationStatus = async (domainName) => {
    try {
        const getVerificationParams = {
            Identities: [ 
                domainName 
            ]
        };
        const getVerificationCommand = new GetIdentityVerificationAttributesCommand(getVerificationParams);
        const data = await sesClient.send(getVerificationCommand);
  
        const status = data.VerificationAttributes[domainName].VerificationStatus;
        
        return (status === "Success");
    } catch (err) {
      console.error("Error checking domain verification status:", err);
    }
};

const deleteMail = async function(key) {
    try {
        const deleteObjectParams = {
            Bucket: config.AWS_INBOUND_EMAILS_BUCKET_NAME,
            Key: key,
        };
      
        await s3Client.send(new DeleteObjectCommand(deleteObjectParams));

        return true;
    } catch (error) {
        console.log(error);
    }
}

const getAccountId = async () => {
    try {
        const getIdentityCommand = new GetCallerIdentityCommand({});
        const data = await stsClient.send(getIdentityCommand);
        
        return data.Account;
    } catch (err) {
        console.error("Error getting AWS Account ID:", err);
    }
};

const sendEmail = async ({ domainName, senderName, senderEmailAddress, toAddresses, ccAddresses, bccAddresses, subject,  }) => {
    try {
        const accountId = await getAccountId();

        const emailParams = {
            Source: `${ senderName } <${ senderEmailAddress }>`, // This can be any string, but the email must be from the verified domain
            Destination: {
                ToAddresses: toAddresses,
                CcAddresses: ccAddresses,
                BccAddresses: bccAddresses
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Html: {
                        Data: "This is another test email sent using Amazon SES. " + new Date(),
                    },
                },
            },
            SourceArn: `arn:aws:ses:${ config.AWS_DEFAULT_REGION }:${ accountId }:identity/${ domainName }`,
        };
   
        // Send the email
        const sendEmailCommand = new SendEmailCommand(emailParams);
    
        await sesClient.send(sendEmailCommand);  
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

const verifyDomain = async (domainName) => {
    try {
        const verifyDomainParams = {
            Domain: domainName,
        };
        const verifyDomainCommand = new VerifyDomainIdentityCommand(verifyDomainParams);
        const data = await sesClient.send(verifyDomainCommand);

        const records = [];

        records.push({
            type: DnsRecordType.TXT,
            value: data.VerificationToken
        });

        records.push({
            type:DnsRecordType.MX,
            value: `inbound-smtp.${ config.AWS_DEFAULT_REGION }.amazonaws.com`,
            priority: 10
        })
        
        return records;
    } catch (err) {
      console.error("Error verifying domain:", err);
    }
};
  
const verifyEmailAddress = async (emailAddress) => {
    try {
        // Verify email address
        const verifyEmailParams = {
            EmailAddress: emailAddress,
        };
        
        const verifyEmailCommand = new VerifyEmailAddressCommand(verifyEmailParams);
        const data = await sesClient.send(verifyEmailCommand);
        console.log(`Email address verification initiated for "${ emailAddress }"`);
        console.log("Verification status:", data.VerificationStatus);
  
        return data.VerificationStatus;
        // When you verify an email address, Amazon SES sends a verification email to the address.
        // You need to click on the verification link in the email to complete the verification process.
    } catch (err) {
      console.error("Error verifying email address:", err);
    }
};

module.exports = {
    checkDomainVerificationStatus,
    deleteMailFromS3,
    deleteMailFromSqs,
    readMailFromS3,
    readMailsFromSqs,
    sendEmail,
    verifyEmailAddress,
    verifyDomain
}