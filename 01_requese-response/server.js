// 导入http模块:
const http = require("http");

// 创建http server，并传入回调函数:
// 回调函数接收request和response对象,
const server = http.createServer((request, response) => {
  let body = [];
  request.on("error", (err) => {
    console.log(err);
  });

  request.on("data", (chunk) => {
    body.push(chunk.toString());
  });

  request.on("end", () => {
    body = Buffer.concat([Buffer.from(body.toString())]).toString();
    console.log("body:", body);
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(" Hello World\n");
  });
});

server.listen(8088);

console.log("server started");
