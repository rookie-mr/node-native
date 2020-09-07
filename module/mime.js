// 获取不同请求类型对应的响应头类型
module.exports =  function(fs, extname, callback) {
    // 同步读取数据方式
    // let data = fs.readFileSync('./mime.json');
    // let Mimes = JSON.parse(data.toString());
    // return Mimes[extname] || 'text/html';

    // 异步读取数据方式——回调函数
    // fs.readFile('./mime.json', function(err, data) {
    //     if (err) {
    //         console.log(err);
    //         return false;
    //     }
        
    //     callback(data);
    // })

    // 异步读取数据方式——事件驱动订阅、发布
    fs.readFile('./mime.json', function(err, data) {
        if (err) {
            console.log(err);
            return false;
        }
        let Mimes = JSON.parse(data.toString());
        // 这里的callback为调用时提供的EventEmitter实例方法
        callback.emit('push-data-' + extname, (Mimes[extname] || 'text/html')); 
    })
}