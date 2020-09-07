// Node 模块
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const event = require('events');

// 模块方法
const app = require('./module/app.js');
const static = require('./module/static_server.js');
const router = require('./module/router_server.js');
const routers = require('./module/routers.js');
const config = require('./module/config.js');
const utils = require('./module/utils.js');

// session中间件
app.use(utils.SessionCheck);
app.use('/api/sse', utils.Sse);

// 将路由上下文指向app
app.set(routers);

// let server = http.createServer(function (req, res) {

//     // ***通过将静态路由封装的方式***
//     static.statics(req, res, 'static')

//     // ***直接写在server文件代码中***
// });

let server = http.createServer(app);

server.listen(config.port);
console.log('sever run at: http://'+ config.host +':' + config.port);