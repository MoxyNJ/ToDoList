const http = require("http");

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
        response.end(`<html lang="en">
        <head>
            <title>test</title>
        <style>
            body #p1{color:#0f0;}
            div,p{padding:0;margin:0}
            p{width:30px;text-algin:center;font-size:24px;}
            div body{padding:20px}
        </style>
    </head>
    <body>
        <img src="1.jpg"/>
        <p id="p1"></p>
        <div>Hello world!</div>
    </body>   
    </html>`);
      });
  })
  .listen(8088);

console.log("server started");
