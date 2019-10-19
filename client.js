
const net = require('net')
const log = function (...arg) { console.log.apply(console, arguments) }
// const fs = require('fs')

const request = function (host, port, callback) {
    const client = net.createConnection(port, host)

    client.on('connect', function () {
        log('client：have created connection with server')
    })

    client.on('data', data => callback(data))

    client.on('close', function () {
        log('client: have close connection')
    })

    const request = `GET / HTTP/1.1\r\nHost: ${host}\r\nConnection: Close\r\n\r\n`
    client.end(request)
}

const __main = function () {
    const host = 'localhost'
    const port = 2000
    request(host, port, log)
}
__main()
