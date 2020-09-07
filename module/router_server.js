// *****路由及服务端渲染*****

// Self 模块
const static = require('./static_server');
const config = require('./config');
const render = require('./render');
const Mimes = require('./mime.js');

// Node 模块
const path = require('path');
const url = require('url');
const fs = require('fs');
const event = require('events');

// 模块方法
const EventEmitter = new event.EventEmitter();
// 取消最大监听器的限制
EventEmitter.setMaxListeners(0);

let ChangeRes = function (res) {
    // 常见的异步请求
    res.send = function (data) {
        res.writeHead(200, { 'Content-Type': 'text/html;charset="utf-8"' })
        res.end(data);
    }

    // 服务端渲染
    res.render = function (template, model) {
        let extname = path.extname(template);

        fs.readFile(config.template + '/' + template, function (err, data) {
            if (err) {
                fs.readFile(staticpath + '/404.html', function (error, data) {
                    if (error) {
                        console.log(error);
                    }
                    res.writeHead(404, { "Content-Type": "text/html;charset='utf-8'" });
                    res.write(data);
                    res.end();
                })
            } else {
                Mimes(fs, extname, EventEmitter);
                EventEmitter.on('push-data-' + extname, function (mime) {
                    res.writeHead(200, { "Content-Type": "" + mime + ";charset='utf-8'" });
                    let buffer = render(data, model);
                    res.end(buffer);
                })

            }
        })
    }
}

let sever = function () {
    let G = this;
    this._get = {};
    this._post = {};

    let app = function (req, res) {
        ChangeRes(res);

        let pathname = url.parse(req.url).pathname;
        let method = req.method.toLowerCase();

        if (!pathname.endsWith('/')) {
            pathname = pathname + '/';
        }

        if (G['_' + method][pathname]) {
            if (method == 'post') {
                let str = '';
                req.on('data', function (data) {
                    str += data;
                });
                req.on('end', function (err, data) {
                    req.body = str;
                    G['_' + method][pathname](req, res);
                })
            } else {
                G['_' + method][pathname](req, res);
            }
        } else {
            // res.send('No Router!');
            static.statics(req, res, config.static);
        }
    }

    app.get = function (key, callback) {
        // 对用户输入的友好处理

        if (!key.startsWith('/')) {
            key = '/' + key;
        }

        if (!key.endsWith('/')) {
            key = key + '/';
        }

        G._get[key] = callback;
    }

    app.post = function (key, callback) {
        // 对用户输入的友好处理

        if (!key.startsWith('/')) {
            key = '/' + key;
        }

        if (!key.endsWith('/')) {
            key = key + '/';
        }

        G._post[key] = callback;
    }

    return app;
}

module.exports = sever();