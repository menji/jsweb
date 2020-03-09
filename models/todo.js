const fs = require('fs');
const Model = require('./model.js')
const _ = require('lodash')

const log = function (...arg) { console.log.apply(console, arguments) }

const now = function() {
    return Math.round(Date.now() / 1000)
}

class Todo extends Model {
    constructor(form) {
        super()
        this.id = _.get(form, 'id', null)
        this.title = _.get(form, 'title')
        const t = now()
        this.created_time = _.get(form, 'created_time', t)
        this.updated_time = _.get(form, 'updated_time', t)
    }
}

module.exports = Todo
