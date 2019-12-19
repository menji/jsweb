const fs = require('fs');
const Model = require('./model.js')
const _ = require('lodash')

const log = function (...arg) { console.log.apply(console, arguments) }


class Todo extends Model {
    constructor(form) {
        super()
        this.id = _.get(form, 'id')
        this.title = _.get(form, 'title')
    }
}

module.exports = Todo
