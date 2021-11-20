// JSON转化为string，解决循环嵌套的问题
module.exports.JSONToStr = function JSONToStr(json) {
  // 缓存中保存所有遇到的 object，
  // 每次添加一个 object 到 cache 中时，就判断 cache 中是否已经保存过该对象，如果保存过，则丢弃该对象。
  var cache = [];
  var str = JSON.stringify(
    json,
    function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // 移除
          // console.log("remove:", value);
          let re = null;
          let res = Object.prototype.toString.call(value);
          if (res === "[object Array]") {
            re = [...value];
          } else if (res === "[object Object]") {
            if (value.tagName)
              re = { tageName: value.tagName, type: value.type };
            else re = { type: value.type };
          }
          return re;
        }
        // 收集所有的值
        cache.push(value);
      }
      return value;
    },
    "  "
  );
  cache = null; // 清空变量，便于垃圾回收机制回收
  return str;
};
// 把string写入到文件中
module.exports.writeString = function writeString(data) {
  let fs = require("fs");
  // 第一个参数：文件路径
  // 第二个参数：文件内容
  // 第三个参数：回调函数
  //    成功：
  //      文件写入成功
  //      error 是 null
  //    失败：
  //      文件写入失败
  //      error 就是错误对象
  fs.writeFile("./data.js", data, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log("success!");
    }
  });
};
