const esl = require('modesl');

const config = require("../../../../constants/config");

const logService = require("../../../logger");

module.exports = async function(domainName) {
    const metadata = {
        service: "freeswitch/domains/create"
    };

    try {
        return new Promise((resolve, reject) => {
            const params = {
                host: config.FREESWITCH_SERVER,
                port: config.FREESWITCH_PORT,
                password: config.FREESWITCH_PASSWORD,
            };

            const connection = new esl.Connection(params);

            connection.on('error', (error) => {
                logService.error(error, metedata);

                reject(error);
            });

            connection.on('esl::end', () => {
                logService.info('FreeSWITCH Connection Closed', metadata);
            });

            connection.on('esl::ready', () => {
                logService.info('FreeSWITCH Connection Ready', metadata);
              
                // Send the command to create a new domain
                const command = `api create_domain ${ domainName }`;
                connection.api(command, (response) => {
                    connection.disconnect();
            
                    resolve(response.getBody());
                });
            });
        }); 
    } catch (error) {
        console.log(error.message);  
    } 
}