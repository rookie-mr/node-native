/**
 * 自定义渲染规则，将读取到的文件处理后返回。目前版本仅支持接收json格式数据
 * @param {String | Buffer} stream 源文件的内容
 * @param {Object} model 类似java的model域
 */
let render = function(stream, model) {
  let page = stream.toString('utf8');

  // 匹配 ${} 形式模板
  let $ = page.match(/\${.*?}/g); 
  
  /**
   * 从model中获取带点参数的最终值
   * @param {String} _v 模板字符串中的值  
   * @param {Object} _model model域数据
   */
  let layered = function(_v, _model) {
    if (_v.indexOf('.') == -1) {
      return _model[_v];
    } else {
      let a = _v.split('.');
      let k = a[0];
      a.shift();
      return layered(a.join('.'), _model[k]);
    }
  }

  // 遍历获取到的模板字符串数组
  $.forEach(function(v, i, a) {
    let _v = v.replace(/\${|}/g, '').trim();
    let _r = layered(_v, model);
    page = page.replace(v, _r);
  })

  return page;
}

module.exports = render;