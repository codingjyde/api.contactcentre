const formData = require('form-data');
const Mailgun = require('mailgun.js');

const config = require("../../../constants/config");

module.exports = async function(name) {
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
        username: 'api', 
        key: config.MAILGUN_PRIVATE_KEY
    });

    const self = this;
    
    try {
        return await mg.domains.get(name);
    } catch (error) {
        return null;
    }
}