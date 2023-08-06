const formData = require('form-data');
const Mailgun = require('mailgun.js');

const config = require("../../../constants/config");

module.exports = async function(name) {
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({
        username: 'api', 
        key: config.MAILGUN_PRIVATE_KEY
    });

    const records = [];

    const response = await mg.domains.create({ 
        name
    });

    for (const record of response.receiving_dns_records) {
        records.push({
            type: record.record_type,
            value: record.value,
            priority: parseInt(record.priority),
        });
    }
    
    for (const record of response.sending_dns_records) {
        records.push({
            type: record.record_type,
            value: record.value,
            name: record.name,
        });
    }

    return {
        name: response.name, 
        records
    }
}