require('crypto-browserify');
require("dotenv").config();

const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const http = require('http');
const vhost = require('vhost');

const config = require("./constants/config"); 

const cors = require("./middleware/cors"); 
const logger = require("./middleware/logger");

const databaseService = require("./services/database");
const freeswitchService = require("./services/freeswitch");
const ioService = require("./services/io");
const jobsService = require("./services/jobs");
const logService = require("./services/logger");
const mailService = require("./services/mail");

const hostApp = require("./controllers/host");
const tenantApp = require("./controllers/tenant");

const app = express();

app.use(bodyParser.json());
app.use(compression());
app.use(cors());
app.use(logger);

const server = http.createServer(app);

const io = ioService.init(server);
  
const port = config.APP_PORT;

app.use(express.static('scripts'));

app.use((req, res, next) => {
  req.io = io;

  next();
})

app.use(vhost(`host.${ config.APP_DOMAIN }`, hostApp));
app.use(vhost(`tenant.${ config.APP_DOMAIN }`, tenantApp));

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function(req, res){
  res.status(404);
  res.json({ error: "Sorry, can't find that" })
});

server.listen(port, async () => {
  logService.info(`Initialising ${ config.APP_NAME }, please wait...`);

  // await databaseService.init();
  //await freeswitchService.init();
  // mailService.init(); 
  // jobsService.init();
  
  logService.info(`${ config.APP_NAME } listening on port ${ port }.`);

  //freeswitchService.createDomain("sterling"); 

  //const mailgunService = require("./services/mailgun");
  //mailgunService.addDomain("cc.innerseede.com");

  const amazonService = require("./services/amazon");

  
  const data = { 
    domainName: "saf.net.ng", senderName: "Another Test!", senderEmailAddress: "mighty@saf.net.ng", 
    toAddresses: ["jidelawal@gmail.com", "jide@pronova.com.ng"], 
    ccAddresses: [], 
    bccAddresses: [], 
    subject: "Tester 3"  }

  // amazonService.sendEmail(data);
  // amazonService.getMail();
  
});