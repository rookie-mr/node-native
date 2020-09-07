// *****路由及服务端渲染*****

/**
 * 路由优先原则如果在自定义路由中未匹配到结果，自动在配置的静态资源目录中加载静态资源。
 * 路由配置返回可调用send和render方法。
 */

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
  // 请求响应的封装位置
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

let PathRewrite = function (path) {
  if (!path) {
    return
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (!path.endsWith('/')) {
    path = path + '/';
  }
  return path;
}

let sever = function () {
  let G = this;
  this._get = {};
  this._post = {};
  this._middleware = {}; // 固定路由中间件
  this._callback = []; // 全局路由回调

  let app = function (req, res) {
    ChangeRes(res);

    let pathname = url.parse(req.url).pathname;
    let method = req.method.toLowerCase();

    if (!pathname.endsWith('/')) {
      pathname = pathname + '/';
    }

    // 中间层的应用部分
    // 全局中间件，对所有路由进行处理，忽略静态资源的请求
    if (G._callback.length > 0 && G['_' + method][pathname]) { 
      G._callback.forEach((v) => {
        if (method == 'post') {
          let str = '';
          req.on('data', function (data) {
            str += data;
          });
          req.on('end', function (err, data) {
            req.body = str;
            v(req, res);
          })
        } else {
          v(req, res);
        }
      })
    }
    // 路由中间件，路由匹配后进行处理
    if (G._middleware[pathname]) {
      if (method == 'post') {
        let str = '';
        req.on('data', function (data) {
          str += data;
        });
        req.on('end', function (err, data) {
          req.body = str;
          G._middleware[pathname](req, res);
        })
      } else {
        G._middleware[pathname](req, res);
      }
    }

    // Get Post 及静态资源封装
    if (G['_' + method][pathname]) {
      if (method == 'post') {
        // 对Form Data和Request Payload两种格式的请求分别处理
        let str = '';
        let chunk = [];
        // buffer格式的数据不可以用相加，会直接把buffer转化为字符串
        if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
          req.on('data', function (data) {
            chunk.push(data);
          });
          req.on('end', function (err, data) {
            req.body = chunk;
            G['_' + method][pathname](req, res);
          })
        } else {
          req.on('data', function (data) {
            str += data;
          });
          req.on('end', function (err, data) {
            req.body = str;
            G['_' + method][pathname](req, res);
          })
        }
      } else {
        G['_' + method][pathname](req, res);
      }
    } else {
      // res.send('No Router!');
      static.statics(req, res, config.static);
    }
  }

  app.get = function (key, callback) {
    let path = PathRewrite(key);
    G._get[path] = callback;
  }

  app.post = function (key, callback) {
    let path = PathRewrite(key);
    G._post[path] = callback;
  }

  app.use = function (key, callback) {
    if (arguments.length === 1) {
      G._callback.push(key);
    }
    if (arguments.length === 2) {
      let path = PathRewrite(key);
      G._middleware[path] = callback;
    }
  }
  
  // 如某一模块希望执行于当前上下文时调用此方法
  app.set = function (callback) {
    if (typeof callback !== 'function') throw new TypeError('params for app.set must be a function!');
    callback.bind(app)();
  };

  return app;
}

module.exports = sever();