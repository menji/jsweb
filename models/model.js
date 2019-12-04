const fs = require('fs');
const log = function (...arg) { console.log.apply(console, arguments) }

const load = function(path) {
    const s = String(fs.readFileSync(path))
    const models = JSON.parse(s)
    return models
}

const save = function(models, path) {
    const s = JSON.stringify(models, null, 4)
    // const models = JSON.parse(s)
    // return models
    fs.writeFileSync(path, s)
}

class Model {
    constructor() {

    }

    static dbPath(cls) {
        const p = 'db/' + cls.name
        return p
    }

    static new(cls, form) {
        const m = new cls(form)
        return m
    }

    static all(cls) {
        const path = Model.dbPath(cls)
        // const cls = this.constructor.name
        const models = load(path)
        const ms = []
        for (const m of models) {
            ms.push(new cls(m))
        }
        return ms
    }

    static beautifyAll(cls) {
        const ms = Model.all(cls)
        const s = JSON.stringify(ms, null, 4)
        return s
    }

    save() {
        const cls = this.constructor
        const models = Model.all(cls)
        models.push(this)
        const path = Model.dbPath(cls)
        save(models, path)
    }
}

module.exports = Model
