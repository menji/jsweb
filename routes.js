
const _ = require("lodash")
const fs = require('fs')
const Model = require('./models/model.js')
const User = require('./models/user.js')
const log = function (...arg) { console.log.apply(console, arguments) }

const session = {
    'session id': {
        'username': 'gua',
    }
}

const messages = []

const currentUser = function(request) {
    log('当前用户', request.cookies)
    const sessionId = _.get(request.cookies, 'cus', '')
    const u = _.get(session, sessionId, null)
    log('得到当前用户', sessionId, u, session)
    return u
}

const requestReffer = function(request) {
    log('登陆时候的 cookies', request.cookies)
    const sessionId = _.get(request.cookies, 'refer', '')
    const reffer = _.get(session, sessionId, null)
    return reffer
}

const randomStr = function() {
    const s = 'sfsdafqrewtervxcvhfdmxcxkjshfisawqweoqdnlfskjfzcxcsfskhzczchi'
    const len = 10
    let r = ''
    for (var i = 0; i < len; i++) {
        const p = Math.floor(Math.random() * (s.length - 2))
        r += s[p]
    }
    return r
}

const routeStatic = function(request) {
    const types = {
        gif: 'doge.gif',
        js: 'text/javascript',
    }
    const filename = _.get(request.query, 'file', 'doge.gif')
    const format = filename.split('.').slice(-1)
    const f = types[format]
    const path = 'static/' + filename
    let header = `HTTP/1.1 200 OK\r\nContent-Type: ${f}\r\n\r\n`
    header = Buffer.from(header)
    const body = fs.readFileSync(path)
    const r = Buffer.concat([header, body])
    return r
}

const routeIndex = function(request) {
    const header = `HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n`
    let body = page('index.html')
    const u = currentUser(request)
    let username = '[Unlogged user]'
    if (u !== null) {
        username = u.username
    }
    body = body.replace('{{user}}', username)
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
    let result = ''
    const headers = {
        'Content-Type': 'text/html',
    }
    if(request.method == 'POST') {
        const form = request.form()
        const u = Model.new(User, form)
        if(u.validateLogin()) {
            result = 'login success'
            const sessionId = randomStr()
            const _u = Model.findBy(User, {username: u.username})
            session[sessionId] = _u
            // request.appendCookies('user', sessionId)
            // const c = request.stringifiedCookies()
            headers['Set-Cookie'] = `cus=${sessionId}`
            const query = request.query
            log('查询', query)
            // const reffer = requestReffer(request)
            let reffer = query.reffer
            log('登陆成功 reffer 哈哈', reffer)
            if (reffer !== undefined) {
                log('要挑转', reffer)
                reffer = '/' + reffer
                return redictTo(reffer, headers)
            }

        } else {
            result = 'login failed'
        }
    }
    let body = page('login.html')
    body = body.replace('{{result}}', result)
    const header = stringifiedHeader(headers)
    log('新的头部', header)
    const r = header + '\r\n' + body
    return r
}

const routeMsg = function(request) {
    const u = currentUser(request)
    let username = ''
    if (u === null) {
        return redictTo('/login?reffer=msg')
    } else {
        username = u.username
    }
    if (request.method === 'POST') {
        const msg = request.form()
        messages.push(msg.message)
    }
    const headers = {
        'Content-Type': 'text/html',
    }
    const header = stringifiedHeader(headers)
    const msgs = messages.join('<br>')
    let body = page('message.html')
    body = body.replace('{{messages}}', msgs)
    body = body.replace('{{user}}', username)
    const r = header + '\r\n' + body
    return r
}

const stringifiedHeader = function(headers, code=200) {
    let header = `HTTP/1.1 ${code} OK\r\n`
    for (const k of Object.keys(headers)) {
        const v = headers[k]
        const s = `${k}: ${v}\r\n`
        header += s
    }
    return header
}

const redictTo = function(path, headers = {}) {
    // const headers = {
    //     Location: path,
    // }
    headers['Location'] = path
    const h = stringifiedHeader(headers, 302)
    return h
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
