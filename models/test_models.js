const log = function (...arg) { console.log.apply(console, arguments) }

const Model = require('./model.js')
const User = require('./user.js')
// const m = new Model()
const us = Model.all(User)
log('all users', us)
const user = {
    username: 'test3',
    password: 'xx',
}
const u = Model.new(User, user)
// u.save()
