const { Server } = require("socket.io");

const logService = require("../logger");
const tokenService = require("../token");

const setupChangeStreams = require("./setup_change_streams");
const webChatMessage = require("./web_chat_message");

const metadata = {
    service: "io"
}

const init = function(server) {
    logService.info("Initialising real-time service, please wait...", metadata);

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.roomPrefix = "upaOm5zd71UKvAF71TSQ-";

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
        
            socket.user = await tokenService.verifyAccessToken(token);

            if(socket.user.organisationId) {
                socket.join(`${ io.roomPrefix }${ socket.user.organisationId }`);
            }
            
            next();    
        } catch (error) {
            console.log(error);  
            
            next(error);
        }
    });

    io.on('connection', (socket) => {
        logService.info("A user connected.");

        socket.on('disconnect', () => {
            logService.info("A user disconnected.");
        });
    });

    setupChangeStreams(io);
    webChatMessage.init(io);

    logService.info("Real-time service initialised.", metadata);

    return io;
}

module.exports = {
    init
}