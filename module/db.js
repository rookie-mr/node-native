const config = require('./config');
const MongoClient = require('mongodb').MongoClient;

let url = `mongodb://${config.db.path}:${config.db.port}/${config.db.name}`;

module.exports = function() {
  // 链接数据库
  const connect = function(cb) { 
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      console.log('链接成功！');
      if (typeof cb === 'function') cb(db);
      db.close();
    }); 
  }
  // 新增集合
  const add = function(o) { 
    connect(function() {

    })
  }
  // 删除
  const del = function(o) { 
    connect(function() {

    })
  }
  // 修改
  const edit = function(o) { 
    connect(function() {

    }) 
  }
  // 查询
  const query = function(o) { 
    connect(function() {

    }) 
  }
  return {
    connect,
    add,
    del,
    edit,
    query,
  }
}()