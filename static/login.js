const log = function (...arg) { console.log.apply(console, arguments) }
log('hello, login')

var e = function(selector) {
    return document.querySelector(selector)
};


const updateActionUrl = function() {
    const f = e('form')
    let a = f.action
    const url = window.location.href
    if (url.includes('?')) {
        const query = url.split('?').slice(-1)
        const action = a + '?' + query
        f.action = action
    }
    window.f = f
}

const __main = function() {
    updateActionUrl()
}
__main()
