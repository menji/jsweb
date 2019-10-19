const net = require("net");
const log = function (...arg) { console.log.apply(console, arguments) }

const handleRequest = function(data, socket) {
    log('client data', data);
    socket.write("goodbye!!!");
    socket.end();
}

const handleError = function(error) {
    log('request error', error);
    // socket.write("goodbye!!!");
    // socket.end();
}

const httpServer = function(handleRequest) {
    const server = net.createServer(function(socket) {
        log("client comming", socket.remoteAddress, socket.remotePort);
        socket.on("close", function() {
            log("close socket");
        });

        socket.on("data", data => handleRequest(data, socket));
        socket.on("error", handleError)

    });

    server.on("listening", function() {
        log("listening...");
    });

    server.on("error", function() {
        log("listen error");
    });

    server.on("close", function() {
        log("server stop listener");
    });

    return server

}

const hostServer = function(config) {
    console.log('in hostServer');
    const server = httpServer(
        handleRequest,
        handleError,
    )
    log('created server', server)
    server.listen(config);
}

const __main = function() {
    const config = {
        port: 2000,
        host: "127.0.0.1",
        exclusive: true,
    }
    log('config', config)
    hostServer(config)
}
__main()
