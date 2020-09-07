// 加密模块
const crypto = require('crypto');

const event = require('events');
const fs = require('fs');

const config = require('./config.js');
const utils = require('./utils.js');
const DB = require('./db.js');

// 模块方法
const EventEmitter = new event.EventEmitter();
// 取消最大监听器的限制
EventEmitter.setMaxListeners(0);

const routers = function () {
  let router = this;
  // 路由配置
  router.get('/login', function (req, res) {
    // 模拟数据库查询后的结果
    let data = {
      user: {
        name: 'zhanggp',
        password: 123456
      }
    };
    res.render('login.html', data);
  });

  router.post('/register', function (req, res) {
    let o = {};
    let s = req.body;
    s.split('&').forEach(function (item, i) {
      o[item.split('=')[0]] = item.split('=')[1];
    });
    DB.connect(function (db) {
      db.db('resume').collection('test').insertOne(o)
    });
    res.send('注册成功！');
  });

  router.post('/message', function (req, res) {
    let o = {};
    let s = req.body;
    s.split('&').forEach(function (item, i) {
      o[item.split('=')[0]] = item.split('=')[1];
    });
    DB.connect(function (db) {
      db.db('resume').collection('message').insertOne(o)
    });
    res.send('succ');
  });

  /**
   * 主动向客户端推送消息
   * 1、用户与服务器之间建立长连接
   * 2、服务器检索当前有无其他用户发来的消息
   * 3、用户向其他用户发送消息
   * 4、服务端接收消息，并推送个指定用户
   */

  // 1、建立长连接，获取根据session获取当前用户
  router.get('/api/sse', function (req, res) {
    try {
      let session = utils.GetCookie(req)[config.SessionKey];
      let user = utils.Sessions.GetUser(session, true); // 当前用户
      res.write(':会话连接成功！\n');
      EventEmitter.on('send-to-' + user, function (data) { // 接收消息的订阅
        console.log(user, '-接收到消息')
        // let d = JSON.parse(data);
        // res.write(JSON.stringify({
        //   from: d.from,
        //   message: d.message,
        // }));
        res.end("event: receive\ndata: " + data + "\n\n");
      });

      // let to = query ? query.split('=')[1] : '';
      // DB.connect(async function (db) {
      //   let o = await db.db('resume').collection('dialog').find({
      //     from: to, to: user
      //   }).toArray();
      //   res.write(JSON.stringify(o));
      // });
    } catch (e) {
      console.log(e.reason, '-长连接会话失败！');
    }
  })

  // 2、TODO

  // 3、向指定用户发送消息
  router.post('/api/dialogue', function (req, res) {
    let {
      to,
      message
    } = JSON.parse(req.body);
    let session = utils.GetCookie(req)[config.SessionKey];
    let from = utils.Sessions.GetUser(session, true);
    let data = {
      message,
      from,
      to,
    };

    // 存入数据库
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('dialog').insertOne(data);
      EventEmitter.emit('send-to-' + to, JSON.stringify(data));
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify({
        message,
        from,
        to,
        type: 'send',
      }));
    });
  })

  /**
   * react-admin 后台管理接口部分含有 /api
   */

  // 管理系统的登录
  router.post('/api/login', function (req, res) {
    let {
      userName,
      password
    } = JSON.parse(req.body);
    new Promise((res, rej) => {
      DB.connect(async function (db) {
        let o = await db.db('resume').collection('user').find({
          $or: [{
            name: userName,
            password
          }, {
            email: userName,
            password
          }]
        }).toArray();
        let result = o.length > 0 ? (o.length > 1 ? {
          status: -1,
          tips: '用户异常不允许登录'
        } : {
          status: 1,
          ...o[0]
        }) : {
          status: 0,
          tips: '用户名或密码错误！'
        };
        res(result);
      });
    }).then((result) => {
      if (result.status === 1) {
        // 有效用户，从角色表获取权限
        let {
          roles
        } = result;
        DB.connect(async function (db) {
          let o = await db.db('resume').collection('roles').find({
            name: roles
          }).toArray();
          o[0] ? (result.permissions = o[0].permissions) : result.permissions = [];

          // TODO 加密后存储
          let session = result.id + '-' + roles + '-' + utils.GetKey(36);
          // 加密
          let secret = config.SecretKey;
          const cipher = crypto.createCipheriv('aes-128-cbc', secret, secret);
          cipher.update(session, 'utf8', 'hex')
          let _session = cipher.final('hex');

          // 登录成功，服务端设置存储session，客户端设置cookie
          utils.Sessions.set(_session);
          utils.SetCookie(res, (config.SessionKey + '=' + _session + ';domain=' + config.host + ';path=/;max-age=' + config.expires));

          res.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8'
          });
          res.end(JSON.stringify(result));
        });
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json;charset=utf-8'
        });
        res.end(JSON.stringify(result));
      }
    })
  });

  // 用户密码修改
  router.post('/api/modifyPassword', function (req, res) {
    let {
      id,
      name,
      oldPassword,
      newPassword
    } = JSON.parse(req.body);
    DB.connect(async function (db) {
      let doc = await db.db('resume').collection('user').findOneAndUpdate({
        $or: [{
          id,
          name,
          password: oldPassword
        }, {
          id,
          email: name,
          password: oldPassword
        }]
      }, {
        $set: {
          'password': newPassword
        },
      }, {});
      let result = {
        status: doc.value.ok
      };
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(result));
    });
  });

  // 获取所有菜单 结合角色返回对应菜单
  router.get('/api/menus', function (req, res) {
    let session = utils.GetCookie(req)[config.SessionKey];
    if (session) {
      // 解密出session中包含的用户信息
      let secret = config.SecretKey;
      try { // 由于服务器重启导致服务端secret变化，客户端未超时，使用新的secret解密session可能导致服务挂掉
        const decipher = crypto.createDecipheriv('aes-128-cbc', secret, secret);
        decipher.update(session, 'hex', 'utf8')
        session = decipher.final().toString();
      } catch (e) {
        console.log(e.reason, '-服务端secret变化解密失败');
      }
      let role = session.split('-') ? session.split('-')[1] : '';
      if (role) {
        new Promise((res, rej) => {
          DB.connect(async function (db) {
            let o = await db.db('resume').collection('roles').find({
              name: role
            }).toArray();
            let permissions = o[0] ? o[0].permissions : [];
            res(permissions);
          });
        }).then((permissions) => {
          DB.connect(async function (db) {
            let o = await db.db('resume').collection('menu').find({
              key: {
                $in: permissions
              }
            }).toArray();
            res.writeHead(200, {
              'Content-Type': 'application/json;charset=utf-8'
            });
            res.end(JSON.stringify(o));
          });
        })
      }
    }
  });

  // 新增菜单
  router.post('/api/menus/add', function (req, res) {
    let s = JSON.parse(req.body);
    new Promise((res, rej) => {
      DB.connect(async function (db) {
        let doc = await db.db('resume').collection('ids').findOneAndUpdate({
          "name": "menu"
        }, {
          $inc: {
            'id': 1
          },
        }, {
          returnNewDocument: true
        });
        res(doc.value.id)
      });
    }).then((id) => {
      DB.connect(async function (db) {
        let o = await db.db('resume').collection('menu').insertOne({
          ...s,
          key: id.toString()
        });
        res.writeHead(200, {
          'Content-Type': 'application/json;charset=utf-8'
        });
        res.end(JSON.stringify(o));
      });
    });
  });

  // 删除菜单
  router.post('/api/menus/del', function (req, res) {
    let s = req.body;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('menu').deleteOne(JSON.parse(s));
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 编辑菜单
  router.post('/api/menus/edit', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      key
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('menu').updateOne({
        key
      }, {
        $set: s
      });
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 返回所有的角色
  router.post('/api/roles', function (req, res) {
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').find().toArray();
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 新增角色
  router.post('/api/roles/add', function (req, res) {
    let s = JSON.parse(req.body);
    s.id = s.name;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').insertOne(s);
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 删除角色
  router.post('/api/roles/del', function (req, res) {
    let s = req.body;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').deleteOne(JSON.parse(s));
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 根据角色id查询角色信息
  router.post('/api/roles/findByRoleId', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      id
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').find({
        id
      }).toArray();
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 根据角色name查询角色信息
  router.post('/api/roles/findByRoleName', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      name
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').find({
        name
      }).toArray();
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 编辑角色
  router.post('/api/roles/edit', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      id
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('roles').updateOne({
        id
      }, {
        $set: s
      });
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 返回所有的用户 带分页参数，含有其他字段时自动进行查询操作
  router.post('/api/users', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      pageNum,
      pageSize
    } = s;
    let skip = (pageNum - 1) * pageSize;
    // 获取查询字段
    let query = utils.Omit(s, ['pageNum', 'pageSize']);
    DB.connect(async function (db) {
      let l = await db.db('resume').collection('user').find(query).skip(skip).limit(pageSize).toArray();
      let result = JSON.stringify({
        list: l,
        total: l.length
      });
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(result);
    });
  });

  // 新增用户
  router.post('/api/users/add', function (req, res) {
    let s = JSON.parse(req.body);
    new Promise((res, rej) => {
      DB.connect(async function (db) {
        let doc = await db.db('resume').collection('ids').findOneAndUpdate({
          "name": "user"
        }, {
          $inc: {
            'id': 1
          },
        }, {
          returnNewDocument: true
        });
        res(doc.value.id)
      });
    }).then((id) => {
      DB.connect(async function (db) {
        let o = await db.db('resume').collection('user').insertOne({
          ...s,
          id,
          password: '123456'
        });
        res.writeHead(200, {
          'Content-Type': 'application/json;charset=utf-8'
        });
        res.end(JSON.stringify(o));
      });
    });
  })

  // 删除用户
  router.post('/api/users/del', function (req, res) {
    let s = req.body;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('user').deleteOne(JSON.parse(s));
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 根据用户id查询用户信息
  router.post('/api/users/findByUserId', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      id
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('user').find({
        id
      }).toArray();
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 编辑用户
  router.post('/api/users/edit', function (req, res) {
    let s = JSON.parse(req.body);
    let {
      id
    } = s;
    DB.connect(async function (db) {
      let o = await db.db('resume').collection('user').updateOne({
        id
      }, {
        $set: s
      });
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(o));
    });
  });

  // 上传头像
  router.post('/api/upload/avatar', function (req, res) {
    // TODO 获取用户信息将头像与用户进行关联
    let session = utils.GetCookie(req)[config.SessionKey];
    let user = utils.Sessions.GetUser(session, true);

    let data = Buffer.concat(req.body); // Buffer类型的数组不可以采用数组方式的连接来进行组合，[].concat.apply([], req.body)[0];
    let rems = [];
    let buffer = data;
    // 根据\r\n分离数据和报头
    for (let i = 0; i < buffer.length; i++) {
      let c = buffer[i];
      let n = buffer[i + 1];
      // 10代表\n 13代表\r
      if (c == 13 && n == 10) {
        rems.push(i);
      }
    }

    // 获取上传文件信息
    let info = buffer.slice(rems[0] + 2, rems[1]).toString();
    let filename = info.match(/filename=".*"/g)[0].split('"')[1];
    // 获取文件的mime
    let type = buffer.slice(rems[1], rems[2]).toString();
    let mime = type.split(': ')[1];

    // 文件数据
    let _buffer = buffer.slice(rems[3] + 2, rems[rems.length - 2]);

    let address = "./files/avatar/" + filename;

    fs.writeFile(address, _buffer, function (err) {
      res.writeHead(200, {
        'content-type': 'text/plain;charset=utf-8'
      });
      if (err) {
        res.end(JSON.stringify({
          "status": 0,
          "message": "上传失败！"
        }));
      } else {
        res.end(JSON.stringify({
          "status": 1,
          "message": "上传成功！",
          "path": address,
        }));
      }
    })
  });

  return router;
}

module.exports = routers;