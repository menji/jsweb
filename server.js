const net = require("net");
const _ = require("lodash")
const fs = require('fs')
const assert = require('assert');
const {
    routeStatic,
    routeDict,
} = require('./routes.js')

const log = function (...arg) { console.log.apply(console, arguments) }

class Request {
    constructor() {
        this.method = 'GET'
        this.path = ''
        this.query = {}
        this.body = ''
        this.headers = {}
        this.cookies = {}
    }

    addCookies() {
        // Cookie: __ncuid=67d18f55-00d6-485d-8fed-413dcab382ae; _ga=GA1.1.800929821.1574731206; CMXID=800929821.1574731206
        const cookies = _.get(this.headers, 'Cookie', '')
        const kvs = cookies.split('; ')
        log('cookie', kvs)
        for(const kv of kvs) {
            if(kv.includes('=')) {
                const [k, v] = kv.split('=')
                this.cookies[k] = v
            }
        }
    }

    stringifiedCookies() {
        const a = []
        for (const k of Object.keys(this.cookies)) {
            const c = `${k}=${this.cookies[k]}`
            a.push(c)
        }
        return a.join('; ')
    }

    appendCookies(key, value) {
        this.cookies[key] = value
    }


    addHeaders(header) {
        const lines = header
        for(const line of lines) {
            const [k, v] = line.split(': ')
            this.headers[k] = line.slice(k.length)
        }

        this.cookies = {}
        this.addCookies()
    }

    // convert body str to dict
    form() {
        // TODO: unquote body
        // body a=b&c=d&e=1
        const parts = this.body.split('&')
        const f = {}
        for (let part of parts) {
            let [k, v] = part.split('=')
            v = decodeURIComponent(v)
            f[k] = v
        }
        return f
    }

}

// get parsed path from path
const parsedPath = function(reqPath) {
    // path?message=msg&author=u
    if (reqPath.includes('?')) {
        const index = reqPath.indexOf('?')
        const path = reqPath.slice(0, index)
        const query_string = reqPath.slice(index + 1)
        const args = query_string.split('&')
        const query = {}
        for (let arg of args) {
            const [k, v] = arg.split('=')
            query[k] = v
        }
        const p = {
            path: path,
            query: query,
        }
        return p

    } else {
        const p = {
            path: reqPath,
            query: {},
        }
        return p
    }
}



const request = new Request()

const error = function(request, code=404) {
    const e = {
        404: 'HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>',
    }
    const r = _.get(e, code, '')
    return r
}



const responseForPath = function(reqPath) {
    const {path, query} = parsedPath(reqPath)
    request.query = query
    let r = {
        '/static': routeStatic,
    }
    r = {
        ...r,
        ...routeDict,
    }
    const response = _.get(r, path, error)
    return response(request)

}

const handleRequest = function(data, socket) {
    const r = String(data)
    log('client data\n', r);
    if(r.split(' ').length < 2){
        socket.end()
    }
    request.method = r.split(' ')[0]

    const header = r.split('\r\n\r\n')[0].split('\r\n').slice(1)
    request.addHeaders(header)
    request.body = r.split('\r\n\r\n')[1]

    const path = r.split(' ')[1]
    const response = responseForPath(path)

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
        port: 3300,
        host: "127.0.0.1",
        exclusive: true,
    }
    log('config', config)
    hostServer(config)
}
__main()
