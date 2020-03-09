
const _ = require("lodash")
const fs = require('fs')
const Model = require('./models/model.js')
const User = require('./models/user.js')
const Todo = require('./models/todo.js')
const log = function (...arg) { console.log.apply(console, arguments) }

const error = function(request, code=404) {
    const e = {
        404: `HTTP/1.1 404 NOT FOUND\r\n\r\n<h1>NOT FOUND</h1>`,
        400: `HTTP/1.1 400 BAD REQUEST\r\n\r\n<h1>BAD REQUEST</h1>`,
    }
    const r = _.get(e, code, '')
    return r
}

const formatedTime = function(time) {
    const date = new Date(time * 1000)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const s = `${month}/${day} ${hours}:${minutes}`
    return s
}

const messages = []

const currentUser = function(request) {
    const sessionId = _.get(request.cookies, 'cus', '')
    const u = _.get(global.session, sessionId, null)
    return u
}

const requestReffer = function(request) {
    const sessionId = _.get(request.cookies, 'refer', '')
    const reffer = _.get(session, sessionId, null)
    return reffer
}

const randomStr = function() {
    const s = 'sfsdafqrewtervxcvhfdmxcxkjshfisawqweoqdnlfskjfzcxcsfskhzczchi'
    const len = 10
    let r = ''
    for (const i = 0; i < len; i++) {
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
    const headers = {
        'Content-Type': 'text/html',
    }

    let body = page('todo_index.html')
    const ms = Model.all(Todo)
    const result = todoTemplate(ms)
    body = body.replace('{{result}}', result)
    const header = stringifiedHeader(headers)
    const r = header + '\r\n' + body
    return r
}

const routeEdit = function(request) {
    const query = request.query
    let id = _.get(query, 'id', null)
    if (id === null) {
        return error(request, 400)
    }
    id = parseInt(id)
    const m = Model.findBy(Todo, {id: id})
    if (m === null) {
        return error(request, 404)
    }
    const headers = {
        'Content-Type': 'text/html',
    }
    let body = page('todo_edit.html')
    // const result = todoTemplate(ms)
    body = body.replace('{{id}}', m.id)
    body = body.replace('{{title}}', m.title)
    const header = stringifiedHeader(headers)
    const r = header + '\r\n' + body
    return r
}


const routeRegister = function(request) {
    const header = 'HTTP/1.1 210 VERY OK\r\nContent-Type: text/html\r\n'
    let result = ''
    if(request.method === 'POST') {
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

const todoTemplate = function(todos) {
    let t = todos.map((todo) => {
       return `<p>
            ${todo.title}
            <a href="/todo/edit?id=${todo.id}">Edit</a>
            <a href="/todo/delete?id=${todo.id}">Delete</a>
            <span class="">Create time: ${formatedTime(todo.created_time)}</span>
            <span class="">Update time: ${formatedTime(todo.updated_time)}</span>
        </p>`
    })
    t = t.join(' ')
    return t
}

const loginRequired = function(request, routeFunction) {
    // const f = function(request) {
        const user = currentUser(request)
        if(user === null) {
            return redictTo('/login')
        }
        return routeFunction(request)
    // }
    // return f
}

const addTodo = function(request) {
    const form = request.form()
    const m = Model.new(Todo, form)
    m.save()
    const path = '/todo'
    return redictTo(path)
}

const deleteTodo = function(request) {
    const query = request.query
    let id = _.get(query, 'id', null)
    if (id === null) {
        return error(request, 400)
    }
    id = parseInt(id)
    const m = Model.findBy(Todo, {id: id})
    if (m === null) {
        return error(request, 404)
    }
    m.remove()
    const path = '/todo'
    return redictTo(path)
}


const updateTodo = function(request) {
    const query = request.query
    let id = _.get(query, 'id', null)
    if (id === null) {
        return error(request, 400)
    }
    id = parseInt(id)
    const m = Model.findBy(Todo, {id: id})
    if (m === null) {
        return error(request, 404)
    }

    const form = request.form()
    form.id = m.id
    form.created_time = m.created_time
    const m1 = Model.new(Todo, form)
    m1.save()
    const path = '/todo'
    return redictTo(path)
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


const routeProfile = function(request) {
    const u = currentUser(request)
    let username = ''
    let note = ''
    if (u === null) {
        return redictTo('/login?reffer=profile')
    } else {
        username = u.username
        note = u.note
    }

    const headers = {
        'Content-Type': 'text/html',
    }
    const header = stringifiedHeader(headers)
    let body = page('profile.html')
    body = body.replace('{{username}}', username)
    body = body.replace('{{note}}', note)
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
    todoRouteDict: {
        '/todo': routeIndex,
        '/todo/edit': routeEdit,

        // '/todo/add': request => loginRequired(request, addTodo),
        // '/todo/delete': request => loginRequired(request, deleteTodo),
        // '/todo/update': request => loginRequired(request, updateTodo),
        '/todo/add': addTodo,
        '/todo/delete': deleteTodo,
        '/todo/update': updateTodo,
    }
}
