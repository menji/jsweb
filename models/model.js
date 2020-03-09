const fs = require('fs');
const log = function (...arg) { console.log.apply(console, arguments) }

const now = function() {
    return Math.round(Date.now() / 1000)
}

const load = function(path) {
    const s = String(fs.readFileSync(path))
    if (s.trim() === '') {
        return []
    }
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

    static findBy(cls, condition) {
        // const path = Model.dbPath(cls)
        // const cls = this.constructor.name
        // const models = load(path)
        const models = Model.all(cls)
        const k = Object.keys(condition).slice(-1)
        const v = condition[k]
        for (const m of models) {
            if (m[k] === v) {
                return m
            }
        }
        return null
    }

    static beautifyAll(cls) {
        const ms = Model.all(cls)
        const s = JSON.stringify(ms, null, 4)
        return s
    }

    save() {
        const cls = this.constructor
        const models = Model.all(cls)
        if (this.id === null) {
            // create
            this.id = 1
            if (models.length > 0) {
                this.id = models.slice(-1)[0].id + 1
            }
            models.push(this)
        } else {
            // update
            const t = now()
            this.updated_time = t
            for (let i = 0; i < models.length; i++) {
                const m = models[i]
                if (m.id === this.id) {
                    models[i] = this
                    break
                }
            }
        }
        const path = Model.dbPath(cls)
        save(models, path)
    }

    remove() {
        const cls = this.constructor
        let models = Model.all(cls)
        models = models.filter((m) => {
           return m.id !== this.id
        })
        const path = Model.dbPath(cls)
        save(models, path)
    }
}

module.exports = Model
