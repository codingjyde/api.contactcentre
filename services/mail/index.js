const formData = require('form-data');
const Mailgun = require('mailgun.js');

const config = require("../../constants/config");

const logService = require("../logger");

let manager = null;

const init = function() {
    logService.info("Initialising mail service, please wait...");

    const mailgun = new Mailgun(formData);
    manager = mailgun.client({
        username: 'api', 
        key: config.MAILGUN_API_KEY
    });
    
    logService.info("Mail service initialised.");
}

const send = async function({ to, cc, bcc, subject, html, text, message, attachment }) {
    const response = await manager.messages.create(config.MAILGUN_DOMAIN, {
        from: `ContactCentre <${ config.MAILGUN_SENDER_EMAIL_ADDRESS }>`,
        to,
        cc,
        bcc,
        subject,
        html,
        text,
        message,
        attachment
    });
}

module.exports = {
    init,
    send
}