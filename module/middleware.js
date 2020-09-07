const app = require('./app.js');
const utils = require('./utils.js');

// session中间件
app.use(utils.SessionCheck);
app.use('/api/sse', utils.Sse);

module.exports = app;