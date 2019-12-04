
const _ = require("lodash")
const fs = require('fs')
const Model = require('./models/model.js')
const User = require('./models/user.js')
const log = function (...arg) { console.log.apply(console, arguments) }


const routeStatic = function(request) {
    //
    // <img src="/static?file=doge.gif"/>
    // GET /static?file=doge.gif
    // path, query = response_for_path('/static?file=doge.gif')
    // path  '/static'
    // query = {
    //     'file', 'doge.gif',
    //
    filename = _.get(request.query, 'file', 'doge.gif')
    path = 'static/' + filename
    let header = `HTTP/1.1 200 OK\r\nContent-Type: image/gif\r\n\r\n`
    header = Buffer.from(header)
    const body = fs.readFileSync(path)
    const r = Buffer.concat([header, body])
    return r
}

const routeIndex = function() {
    const header = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n`
    const body = `
        <!DOCTYPE html>
        <html lang="en" dir="ltr">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                <title>首页</title>
            </head>
            <body>
                <h1>首页</h1>
                <img src="/static?file=doge.gif" alt="" />
            </body>
        </html>
    `
    const r = header + '\r\n' + body
    return r
}

const routeRegister = function(request) {
    const header = 'HTTP/1.1 210 VERY OK\r\nContent-Type: text/html\r\n'
    let result = ''
    if(request.method === 'POST') {
        // HTTP BODY
        // username=test&password=123
        // request.form convert it to dict
        log('此时的form body', request.body)
        const form = request.form()
        const u = Model.new(User, form)
        if(u.validateRegister()) {
            u.save()
            result = `register successful <br> <pre>${Model.beautifyAll(User)}</pre>`
        } else {
            result = 'invalid username or password'
        }
    }

    let body = page('register.html')
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    return r
}


const routeLogin = function(request) {
    const header = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n'
    let result = ''
    if(request.method == 'POST') {
        const form = request.form()
        const u = Model.new(User, form)
        if(u.validateLogin()) {
            result = 'login success'
        } else {
            result = 'login failed'
        }
    }
    let body = page('login.html')
    body = body.replace('{{result}}', result)
    const r = header + '\r\n' + body
    return r
}

const routeMsg = function() {
    const header = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n`
    const body = page('message.html')
    const r = header + '\r\n' + body
    return r
}

const page = function (name) {
    const n = 'templates/' + name
    const s = fs.readFileSync(n)
    return String(s)
}

module.exports = {
    routeStatic,
    routeDict: {
        '/': routeIndex,
        '/msg': routeMsg,
        '/register': routeRegister,
        '/login': routeLogin,
    }
}
