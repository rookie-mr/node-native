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

let config = {
  host: '127.0.0.1',
  port: 9527,
  static: 'static',
  template: 'template',
  expires: 6000, // session时长
  SessionIgnore: ['/login', '/api/login'],
  SessionKey: 'session', // 存入客户端cookie的key
  SecretKey: GetKey(26, 16), // 服务端重启会变化的密钥
  db: {
    path: '127.0.0.1',
    port: '27017',
    name: 'node-native',
  }
}

module.exports = config;