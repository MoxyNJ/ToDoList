const http = require("http");
const htmlCode = require("./importHtml");

http
  .createServer((request, response) => {
    let body = [];
    request
      .on("error", (err) => {
        console.log(err);
      })
      .on("data", (chunk) => {
        body.push(chunk.toString());
      })
      .on("end", () => {
        body = body.join(" ");

        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(htmlCode);
      });
  })
  .listen(8088);

console.log("server started");
