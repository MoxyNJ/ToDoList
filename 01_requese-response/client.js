const net = require("net");

// Request 类
class Request {
  constructor(options) {
    // 把数据都保存起来，并提供一个默认值。
    this.method = options.method || "GET";
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || "/";
    this.body = options.body || {};
    this.headers = options.headers || {};
    // 请求体
    this.bodyText = null;

    // 对 headers 的 "Content-Type" 字段进行判断：
    // 如果 "Content-Type" 不存在，给一个默认值
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // 如果 "Content-Type" 是 json，body 就调用 stringify 转化
    // 如果 "Content-Type" 是 x-www-form-urlencoded，body 中的 kv 就是 & 符号分割的，转化一下
    if (this.headers["Content-Type"] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    } else if (
      this.headers["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      // body 是一个 object
      // 需要用 encodeURIComponent 对 value 进行转化
      // 最后生成一个字符串：key1=value1&key2=value2... 的形式
      this.bodyText = Object.keys(this.body)
        .map((key, index) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    }

    this.headers["Content-Length"] = this.bodyText.length;
  }

  /**
   * send 方法，会在 request 请求构建结束时，把这个请求发送出去。
   * 构建一个 connection ，如果没有就默认创建一个 connection 参数。
   *
   */

  send(connection) {
    // 调用 send 会立即执行 Promise，然后等待一个 resolve
    return new Promise((resolve, reject) => {
      // parser 实例化一个响应解析实例，用于解析接收到的数据。
      const parser = new ResponseParser();
      // 判断 connection 是否已经构建好；
      // 如果存在，则直接写到 write 属性上，toString 是一个自定义方法
      if (connection) {
        connection.write(this.toString());
      } else {
        // 如果不存在则 create connection，调用net的API
        // host 和 port 是 option 传递过来的
        // 创建成功后，会调用第二个回调函数，把构建好的内容写入 write 属性上。
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );
      }
      // 监听data，开始接受数据时调用，把收到的数据字符串化然后传递给 parser。
      connection.on("data", (data) => {
        parser.receive(data.toString());
        // 如果 parser 已经结束，执行 resolve 结束这个 promise
        // connection.end API 断开连接
        if (parser.isFinished) {
          resolve(parser.response);
          connection.end();
        }
      });
      // 监听 error，遇到错误直接结束
      connection.on("error", (err) => {
        reject(err);
        connection.end();
      });
    });
  }

  // 把 option 收到的各种信息，整理成一个发送给服务器的 request：
  // 是一个 string：请求行 + 请求头 + 空行 + 请求体
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join("\r\n")}\r
\r
${this.bodyText}`;
  }
}

/**
 * ResponseParser 产生 Response 响应头、响应行和响应体；
 * 会逐步的接收 response 的每一个char，并进行分析，放入对应的属性中；
 * 利用状态机处理 response。
 * 响应体有多种格式，所以额外利用TrunkedBodyParser去解析。
 */
class ResponseParser {
  constructor() {
    // 响应行：status line 有 \r 和 \n 两个状态。
    this.WATTING_STATUS_LINE = 0;
    this.WATTING_STATUS_LINE_END = 1;
    // 响应头中每一个KV对，有四个状态：
    //    name等待输入、name冒号后等待空格、value等待输入、当前 KV 对结束
    this.WATTING_HEADER_NAME = 2;
    this.WATTING_HEADER_SPACE = 3;
    this.WATTING_HEADER_VALUE = 4;
    this.WATTING_HEADER_LINE_END = 5;
    // header之后，还要等一个空行。
    this.WATTING_HEADER_BLOCK_END = 6;
    // body 格式不固定，所以这里不细节判断，只有一个状态。
    this.WATTING_BODY = 7;

    // 初始化当前状态，当前状态是等待请求行的 \r 字符。
    this.current = this.WATTING_STATUS_LINE;
    // 定义请求行、请求头
    this.statusLine = "";
    this.headers = {};
    // ｛请求头中的某个key字段，某个value字段｝
    this.headName = "";
    this.headValue = "";
    // 请求体，请求体的解析交给另一个的状态机处理，此为TrunkedBodyParser的实例
    this.bodyParser = null;
  }

  // parser 结束的标记
  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  // 把全部解析的响应内容组成一个 object 返回。
  get response() {
    // 解析请求行，利用RegExp。
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      // 状态码+状态名： "200 OK"
      StatusCode: RegExp.$1,
      StatusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  // 接收date信息是string，利用状态机循环读取 string 中的每一个字符。
  receive(string) {
    for (let i = 0; i < string.length; i++) {
      // 利用 charAt 从字符串中返回每一个字符。
      this.receiveChar(string.charAt(i));
    }
  }

  //每当接收一个 char 字符就调用receiveChar判断状态，然后切换状态，或者接收字符。
  receiveChar(char) {
    //WATTING_STATUS_LINE状态，是一只等待 '\r' 字符串，在遇到 \r 之前的内容，都是响应行。
    if (this.current === this.WATTING_STATUS_LINE) {
      if (char === "\r") this.current = this.WATTING_STATUS_LINE_END;
      else this.statusLine += char;
    } else if (this.current === this.WATTING_STATUS_LINE_END) {
      // console.log(string.charAt(i))
      // this.statusLine.push(char);
      if (char === "\n") {
        this.current = this.WATTING_HEADER_NAME;
      }
    } else if (this.current === this.WATTING_HEADER_NAME) {
      // console.log(char);
      if (char === ":") {
        this.current = this.WATTING_HEADER_SPACE;
        // console.log("break 1");
      } else if (char === "\r") {
        this.current = this.WATTING_HEADER_BLOCK_END;
        // WATTING_HEADER_BLOCK_END 状态时，表明所有 header 都接受完毕。
        // 在这里要先找一下Transfer-Encoding字段的值，来确定响应体中内容结构。
        // 这里toy browser就写死使用 node 默认的 chunked 格式。
        // 创建一个 TrunkedBodyParser 实例来接收即将到来的响应体。
        if (this.headers["Transfer-Encoding"] === "chunked")
          this.bodyParser = new TrunkedBodyParser();
      } else {
        this.headName += char;
      }
    } else if (this.current === this.WATTING_HEADER_SPACE) {
      if (char === " ") {
        this.current = this.WATTING_HEADER_VALUE;
      } else {
        this.statusLine += char;
      }
    } else if (this.current === this.WATTING_HEADER_VALUE) {
      if (char === "\r") {
        // 如果等到 header中某个字段的value结束，就会把这对 KV 写入 headValue中，同时清空headerName和headerValue
        this.current = this.WATTING_HEADER_LINE_END;
        this.headers[this.headName] = this.headValue;
        this.headName = "";
        this.headValue = "";
      } else {
        this.headValue += char;
      }
    } else if (this.current === this.WATTING_HEADER_LINE_END) {
      if (char === "\n") {
        this.current = this.WATTING_HEADER_NAME;
      }
    } else if (this.current === this.WATTING_HEADER_BLOCK_END) {
      if (char === "\n") {
        this.current = this.WATTING_BODY;
      }
    } else if (this.current === this.WATTING_BODY) {
      // 当状态机切换到 body 中时，
      // 把 char 传递给 TrunkedBodyParser的实例化对象 bodyParser 去处理
      // 全部的 char 都调用 bodyParser的receiveCha方法去处理
      this.bodyParser.receiveChar(char);
      // if(this.current === )
    }
  }
}

/**
 * 响应体有多种格式，所以额外利用TrunkedBodyParser去解析。
 * 这里只定义了 chunked 格式的响应体解析方式。
 * 会在上面的ResponseParser中实例化调用。
 */
class TrunkedBodyParser {
  constructor() {
    // 请求头开头的长度状态，通过这两个状态计算出响应体内容的总长度。
    this.WATTING_LENGTH = 0;
    this.WATTING_LENGTH_LINE_END = 1;
    // 计算length长度，当长度达到，会切换该状态，表明响应体内容的结束。
    this.REANING_TRUNK = 2;
    // chrunk的最后还有一行，这行开头结尾两个状态。
    this.WATTING_NEW_LINE = 3;
    this.WATTING_NEW_LINE_END = 4;

    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WATTING_LENGTH;
  }

  // 接收每一个字符串，然后分析。
  receiveChar(char) {
    // console.log(JSON.stringify(char)) //可打印 \n \r 字符
    if (this.current === this.WATTING_LENGTH) {
      if (char === "\r") {
        // 如果值为0，则说明 body 内容为空，切换上级(ResponseParser)的isFinished属性为true，解析结束。
        if (this.length === 0) {
          this.isFinished = true;
        }
        this.current = this.WATTING_LENGTH_LINE_END;
      } else {
        //chunked 的 length 是十六进制，这这行代码转化为10进制。
        // 读取第一个值时，length为null，*16无效；
        // 但如果读取第二个以上的值，每当有新的值加入，就会把旧的值乘16，然后把新加入的值放到个位数中。
        this.length *= 16;
        this.length += parseInt(char, 16);
      }
    } else if (this.current === this.WATTING_LENGTH_LINE_END) {
      console.log("WATTING_LENGTH_LINE_END");
      if (char === "\n") {
        this.current = this.REANING_TRUNK;
      }
    } else if (this.current === this.REANING_TRUNK) {
      // 把body内容都加入到content属性中，每加入一个字符，总长度-1
      this.content.push(char);
      this.length--;
      // 当 length 为 0 时，表明 body 内容结束，切换状态
      if (this.length === 0) {
        this.current = this.WATTING_NEW_LINE;
      }
    } else if (this.current === this.WATTING_NEW_LINE) {
      if (char === "\r") {
        this.current = this.WATTING_NEW_LINE_END;
      }
    } else if (this.current === this.WATTING_NEW_LINE_END) {
      if (char === "\n") {
        this.current = this.WATTING_LENGTH;
      }
    }
  }
}

// --------- 执行 ----------
void (async function () {
  let request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "8088",
    path: "/",
    headers: {
      ["X-Foo2"]: "customed",
    },
    body: {
      name: "Moxy",
    },
  });

  let response = await request.send();

  console.log(response);
})();
