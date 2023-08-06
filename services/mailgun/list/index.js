const formData = require('form-data');
const Mailgun = require('mailgun.js');

const config = require("../../../constants/config");

module.exports = async function(name) {
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
        username: 'api', 
        key: config.MAILGUN_PRIVATE_KEY
    });

    const records = await mg.domains.list();

    return {
        records
    }
}