
const net = require('net')
const log = function (...arg) { console.log.apply(console, arguments) }
// const fs = require('fs')
const assert = require('assert');

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

// get protocol of url
const protocolOfUrl = function(url) {
    const arr = url.split('://')
    let p = 'http'
    if(arr[0] === 'https') {
        p = arr[0]
    }
    return p
}

// get protocol, host, port, path from url
const parsedUrl = function(url) {
    const protocols = ['http', 'https']
    let [protocol, host] = url.split('://')
    if (!protocols.includes(protocol)) {
        protocol = 'http'
        host = url
    }

    let path = '/'
    const p = host.search('/')
    if (p !== -1) {
        path = host.slice(p)
        host = host.slice(0, p)
    }

    const ports = {
        http: 80,
        https: 443,
    }
    let port = ports[protocol]
    const portMark = host.search(':')
    if (portMark !== -1) {
        port = host.slice(portMark + 1)
        host = host.slice(0, portMark)
    }

    return {
        protocol,
        host,
        port,
        path,
    }
}

const test_parsedUrl = function() {
    const urls = [
        'g.cn',
        'g.cn/',
        'g.cn:3000',
        'g.cn:3000/search',
        'http://g.cn',
        'https://g.cn',
        'http://g.cn/',
    ]

    const expected = [
        ['http', 'g.cn', '80', '/'],
        ['http', 'g.cn', '80', '/'],
        ['http', 'g.cn', '3000', '/'],
        ['http', 'g.cn', '3000', '/search'],
        ['http', 'g.cn', '80', '/'],
        ['https', 'g.cn', '443', '/'],
        ['http', 'g.cn', '80', '/'],
    ]
    for (var i = 0; i < urls.length; i++) {
        const url = urls[i]
        const parsed = parsedUrl(url)
        const e = expected[i]
        assert.equal(e[0], parsed.protocol, `Case ${i} protocol error`)
        assert.equal(e[1], parsed.host, `Case ${i} host error`)
        assert.equal(e[2], parsed.port, `Case ${i} port error`)
        assert.equal(e[3], parsed.path, `Case ${i} path error`)
    }
}

const __main = function () {
    // const host = 'localhost'
    // const port = 2000
    // request(host, port, log)
    test_parsedUrl()
}
__main()
