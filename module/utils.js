// 加密模块
const crypto = require('crypto');

const config = require('./config.js');

// 剔除对象的一些字段
let Omit = function (o, keys) {
  if (!keys) {
    return o;
  }
  let _keys = Object.keys(o);
  let result = {};
  let ignore = typeof keys === 'string' ? [].push(keys) : keys;
  _keys.forEach((v) => {
    if (ignore.indexOf(v) === -1) {
      o[v] && (result[v] = o[v]);
    }
  })
  return result;
}

// 获取随机字符串
const GetKey = function (type, length) {
  let _type = type || 26; //26纯英文，36英文数字混合
  let _length = length || 4;
  let s = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  let result = '';
  for (let i = 0; i < _length; i++) {
    let c = s[Math.floor(Math.random() * (_type))].toString();
    Math.random() > 0.5 && (c = c.toUpperCase());
    result += c;
  }
  return result;
}

// session相关操作及所有用户的session存储
let Sessions = {
  users: [],
  set: function (id) {
    let session = id;
    // TODO 如加密后需要解密后获取信息再添加至缓存
    let secret = config.SecretKey;
    const decipher = crypto.createDecipheriv('aes-128-cbc', secret, secret);
    decipher.update(session, 'hex', 'utf8')
    session = decipher.final().toString();
    let index = session ? session.split('-')[0] : '';
    // 以用户id作为下标，替换session或新加入
    Sessions.users[index] = id;
  },
  remove: function (id) {
    let index = Sessions.users.indexOf(id);
    if (index != -1) {
      Sessions.users[index] = null;
    }
  },
  find: function (id) {
    let index = Sessions.users.indexOf(id);
    if (index != -1) {
      return true;
    } else {
      return false;
    }
  },
  GetAllSession: function () {
    return this.users;
  },
  ParseSession: function (session) { // 对称解密需传入加密后的session
    // 解密出session中包含的用户信息
    let secret = config.SecretKey;
    try { // 由于服务器重启导致服务端secret变化，客户端未超时，使用新的secret解密session可能导致服务挂掉
      const decipher = crypto.createDecipheriv('aes-128-cbc', secret, secret);
      decipher.update(session, 'hex', 'utf8');
      session = decipher.final().toString();
    } catch (e) {
      console.log(e.reason, '-Decryption failure');
      return '';
    }
    return session;
  },
  GetUser: function (session, parse) { // parse 传入的session是否需要解密
    session = (parse ? this.ParseSession(session) : session) || '';
    return session.split('-')[0];
  },
  GetRole: function (session, parse) { // parse 传入的session是否需要解密
    session = (parse ? this.ParseSession(session) : session) || '';
    return session.split('-')[1];
  }
}

// 获取请求cookie及设置响应cookie
let GetCookie = function (req) {
  let Cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function (Cookie) {
    let parts = Cookie.split('=');
    Cookies[parts[0].trim()] = (parts[1] || '').trim();
  });
  return Cookies;
}
let SetCookie = function (res, v) {
  res.setHeader(
    'Access-Control-Allow-Credentials', true
  );
  res.setHeader(
    'Set-Cookie', v
  );
}

// 校验用户session是否失效
const SessionCheck = function (req, res) {
  // 跳过登录的session检查
  try {
    if (config.SessionIgnore.indexOf(req.headers.referer.replace(req.headers.origin, '')) !== -1) {
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }

  let cookie = GetCookie(req);
  if (cookie[config.SessionKey]) {
    let state = Sessions.find(cookie[config.SessionKey]) ? 1 : -1;
    if (state === -1) {
      let result = {
        state: -1,
        message: 'Session失效'
      }
      res.writeHead(401, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify(result));
    } else { // 有效session将过期时间重置
      SetCookie(res, config.SessionKey + '=' + cookie[config.SessionKey] + ';domain=' + config.host + ';path=/;max-age=' + config.expires)
    }
  } else { // 未登录或页面超时
    let result = {
      state: -1,
      message: 'Session失效'
    }
    res.writeHead(401, { 'Content-Type': 'application/json;charset=utf-8' });
    res.end(JSON.stringify(result));
  }
};

// 启动服务端推送中间件 
const Sse = function (req, res) {
  // res.writeHead(200, { 'Content-Type': 'text/event-stream;charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*' });
  res.writeHead(200, {
    "Content-Type": "text/event-stream;charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": '*',
  });
};

module.exports = {
  Omit,
  GetKey,
  GetCookie,
  SetCookie,
  Sessions,
  SessionCheck,
  Sse,
}