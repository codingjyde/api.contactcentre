const esl = require('modesl');

const config = require("../../../../constants/config");

const logService = require("../../../logger");

module.exports = async function(domainName) {
    const metadata = {
        service: "freeswitch/domains/create"
    };

    try {
        return new Promise((resolve, reject) => {
            try {
                
            const connection = new esl.Connection(config.FREESWITCH_SERVER, config.FREESWITCH_PORT, config.FREESWITCH_PASSWORD);

            console.log("beta");
            //console.log(connection);

            connection.events('plain', 'all');

            // Listen for all events
            connection.on('esl::event::*', (event) => {
                console.log('Received Event:', event.serialize());
            });

            connection.on('error', (error) => {
                console.log(1);
                logService.error(error, metadata);

                reject(error);
            });

            connection.on('*', (data) => {
                console.log("delta");
                logService.info(data, metadata);
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
            } catch (error) {
                console.log("gamma");
            }
        }); 
    } catch (error) {
        console.log("alpha");
        console.log(error.message);  
    } 
}