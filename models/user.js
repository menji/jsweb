const fs = require('fs');
const Model = require('./model.js')
const _ = require('lodash')

const log = function (...arg) { console.log.apply(console, arguments) }


class User extends Model {
    constructor(form) {
        super()
        this.id = _.get(form, 'id', null)
        this.username = form.username
        this.password = form.password
        this.note = form.note
        this.role = _.get(form, 'role', 10)
    }

    isAdmin() {
        return this.role === 1
    }

    validateRegister() {
        const v = this.username.length >= 2 && this.password.length > 2
        return v
    }

    validateLogin() {
        const users = Model.all(User)
        const matched = users.filter(u => u.username === this.username && u.password === this.password)
        return matched.length === 1
    }
}

module.exports = User
