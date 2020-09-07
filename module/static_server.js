// *****静态文件服务*****

// Node 模块
const path = require('path');
const url = require('url');
const fs = require('fs');
const event = require('events');
const Mimes = require('./mime.js');

// 模块方法
const EventEmitter = new event.EventEmitter();
// 取消最大监听器的限制
EventEmitter.setMaxListeners(0);

module.exports.statics = function(req, res, staticpath) {
    let pathname = url.parse(req.url).pathname;
    let extname = path.extname(pathname);

    if (pathname == '/favicon.ico') {
        return false;
    }

    if (pathname == '/') {
        pathname = '/index.html';
    }

    fs.readFile(staticpath + '/' + pathname, function (err, data) {
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
            EventEmitter.on('push-data-' + extname, function(mime) {
                res.writeHead(200, { "Content-Type": ""+ mime +";charset='utf-8'" });
                //res.write(data);
                res.end(data);
            })
            
        }
    })
}