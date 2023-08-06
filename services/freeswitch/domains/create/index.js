const esl = require('modesl');

const config = require("../../../../constants/config");

module.exports = async function(name) {
    try {
        // Define the FreeSWITCH server connection parameters
        const fsHost = config.FREESWITCH_SERVER;
        const fsPort = config.FREESWITCH_PORT;
        const fsPassword = config.FREESWITCH_PASSWORD;

        // Connect to the FreeSWITCH server using the modesl library
        const conn = new esl.Connection(fsHost, fsPort, fsPassword, () => {
            console.log('Connected to FreeSWITCH server');
  
            // Define the command to create a new domain
            const command = 'api create_domain domain_name=example.com';
  
            // Execute the command and handle the response
            conn.api(command, (res) => {
                console.log('Response:', res.getBody()); 
                conn.disconnect();
            });
        });

        conn.on("esl::**", (data) => {
            console.log(data);
        });
  
        conn.on('error', (err) => {
            console.log(`Error: ${err}`);
        });  
          
 
        console.log(fsHost); 
        console.log(fsPort); 
        console.log(fsPassword);  

        // eslConnection.on('esl::event::*::*', (test) => {
        //     console.log(test);    
        //     //console.log('ESL connection ready!');
        // });  

        // // When the connection is established, create a new domain
        // eslConnection.on('esl::ready', () => {
        //     console.log('Connected to FreeSWITCH server');   
    
        //     // Define the new domain name and UUID    
        //     const domainName = 'example.com';
  
        //     // Create the domain using the "bgapi" command
        //     eslConnection.bgapi(`create_domain ${domainName} ${domainUuid}`, (res) => {
        //         console.log('Domain creation response:', res.getBody());
        //         eslConnection.disconnect(); 
        //     });  
        // });  
  
        // // When the connection is closed, log a message
        // eslConnection.on('esl::end', () => {  
        //     console.log('Disconnected from FreeSWITCH server');
        // });

        // // When an error occurs, log the error message
        // eslConnection.on('error', (err) => {
        //     console.error('ESL connection error:', err);
        // });    
    } catch (error) {
        console.log(error.message);  
    } 
}