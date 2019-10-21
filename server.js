const net = require("net");
const log = function (...arg) { console.log.apply(console, arguments) }

const handleRequest = function(data, socket) {
    const str = String(data)
    log('client data\n', str);
    const html = `<!DOCTYPE html>
    <html lang="en" dir="ltr">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
            <title></title>
        </head>
        <body>
            中文, 你好
        </body>
    </html>`
    const response = `HTTP/1.1 200 Success\r\nHOST: localhost\r\n\r\n${html}`
    socket.write(response);
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

    server.on("listening", function(data) {
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
    // log('created server', server)
    server.listen(config);
}

const __main = function() {
    const config = {
        port: 3000,
        host: "127.0.0.1",
        exclusive: true,
    }
    log('config', config)
    hostServer(config)
}
__main()
