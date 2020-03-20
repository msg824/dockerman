const proxy = require('http-proxy-middleware')

if (process.env.NODE_ENV === 'production') {
    var configs = 'http://dev.cedar.kr:3333'
} else if (process.env.NODE_ENV === 'development') {
    var configs = 'http://locahlost:5000'
}
module.exports = function(app) {
    app.use(proxy('/api/*', { target: configs }))
}