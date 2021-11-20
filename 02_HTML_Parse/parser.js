let currentToken = null; // 标签 token
let currentAttribute = null; // 属性 token
let currentTextNode = null; // emit中的文本节点

// 利用 stack 结构解析 DOM 树
let stack = [{ type: "document", children: [] }];

// 处理准备好的 token
{
  /* token:
  {type: 'startTag', tagName: 'html', lang: 'en'}*/
}
function emit(token) {
  // 每次新来一个 token，先从栈顶先出去一个 token 与新来的 token 进行对比。
  let top = stack[stack.length - 1];

  // 准备执行入栈操作

  // 如果是开始标签，新建element
  if (token.type == "startTag") {
    let element = { type: "element", children: [], attributes: [] };
    element.tagName = token.tagName;

    // 遍历 token 的内容，找到属性名然后放入 element.attributes 中

    for (let item in token) {
      if (item != "type" && item != "tagName")
        element.attributes.push({
          name: item,
          value: token[item],
        });
    }
    // 与父element建立双向关系
    top.children.push(element);
    element.parent = top;

    //如果是自封闭的，没有必要放入栈中，因为其肯定没有子节点，
    //如果不是自封闭的，push入栈，等待子节点。
    if (!token.isSelfClosing) stack.push(element);

    currentTextNode = null;

    // 如果是结束标签，则接下来不再有子节点加入了，pop出栈
    // 这里要判断一些是否与当前的tagName相等配对，如果不相等报错。
  } else if (token.type == "endTag") {
    if (top.tagName != token.tagName) {
      throw new Error("Tag start end doesn't match!");
    } else {
      stack.pop();
    }
    currentTextNode = null;
    // 文本节点的处理
  } else if (token.type == "text") {
    if (currentTextNode == null) {
      currentTextNode = {
        type: "text",
        content: "",
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

const EOF = Symbol("EOF"); // 文件终结符号，唯一

// data 状态是初始状态，
//     '<'，  则是元素的标签开始状态
//     'EOF'，则是html字符串结束状态，提交 EOF Token
//    如果不是这两个状态，就是文本节点，提交 text Token
function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    emit({
      type: "EOF",
    });
  } else {
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

{
  /* <div */
}
// 元素的标签开始状态
//     "/"，是标签的结束
//     如果是英文字母，则肯定是开始标签，或自封闭标签，
//     此时收集标签名类型 startTag: currentToken + 把值传递给 tageName(c)。
function tagOpen(c) {
  if (c == "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else {
    return;
  }
}

// 元素的标签结束状态
//   此时一定是要收集标签名
//    - 此时收集标签名类型 endTag: currentToken + 把值传递给 tageName(c)。
//   如果在 '<' 后面紧跟着 '>'，或者 EOF，则说明 html 格式不正确，应当报错
//   'EOF'，则是html字符串结束状态
function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagName(c);
  } else if (c == ">") {
    // 错误纠正
  } else if (c == EOF) {
    // 错误纠正
  } else {
    // 错误纠正
  }
}

// 收集元素的标签名，
//    标签名一定是以空白符号结束的，有四个：tab、换行、禁止、空格
//    如果后面是空白符号，表明后面即将跟上属性了，此时进入读取属性名状态
//    如果后面是 '/' 表明标签要封闭了，进入自封闭标签状态
//    如果后面是字符，则表明正在读取标签名，写入到 currentToken.tagName 中，然后进入 tagName 继续获取
//    如果是 '>'，则表明是普通的开始标签，结束标签名获取，然后把完整的 currentToken 输出，同时进入 data 状态。
//    最后一个 else 是兜底的，为了防止出现意外，循环进入 tagName 状态，只有遇到 '>' 才退出。
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c; //.toLowerCase();
    return tagName;
  } else if (c == ">") {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

{
  /* <html xxx ---> 处理属性名称的开始状态  */
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 表明此时有多的空格等无关符号，直接跳过继续在处理属性名称的开始状态
    return beforeAttributeName;
  } else if (c == "/" || c == ">" || c == EOF) {
    // 表明进入属性名称结束状态。
    return afterAttributeName(c);
  } else if (c == "=") {
    // 错误处理
  } else {
    //    遇到字符
    currentAttribute = {
      name: "",
      value: "",
    };
    // console.log(`currentAttribute:${currentAttribute}`)
    return attributeName(c);
  }
}

{
  /* <div class ---> 处理属性名称的内容状态*/
}
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    // 进入：处理属性名称的结束状态，这个属性名没有值：<a exact />
    return afterAttributeName(c);
  } else if (c == "=") {
    // 进入：处理属性值的开始状态
    return beforeAttributeValue;
  } else if (c == "\u0000") {
    // 错误处理，是Unicode中的控制字符，表示不可显字符
  } else if (c == '"' || c == "'" || c == "<") {
    // 错误处理
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

// 处理属性名称的结束状态
function afterAttributeName(c) {
  if (c.match(/^[/t/n/f ]$/)) {
    return afterAttributeName;
  } else if (c == "/") {
    return selClosingStartTag;
  } else if (c == "=") {
    return beforeAttributeValue;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
    // 错误处理
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: "",
      value: "",
    };
    return attributeName(c);
  }
}

// 处理属性值的开始状态
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return doubleQuotedAttributeValue;
  } else if (c == "'") {
    return singleQuotedAttributeValue;
  } else if (c == ">") {
    // return data；
  } else {
    return UnQuotedAttributeValue(c);
  }
}

// 双引号包裹的属性值状态
function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuoteAttributeValue;
  } else if (c == "\u0000") {
    // 错误处理，是Unicode中的控制字符，表示不可显字符
  } else if (c == EOF) {
    // 错误处理
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

// 单引号包裹的属性值状态
function singleQuotedAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuoteAttributeValue;
  } else if (c == "\u0000") {
    // 错误处理
  } else if (c == EOF) {
    // 错误处理
  } else {
    currentAttribute.value += c;
    // return singleQuotedAttributeValue;
    return doubleQuotedAttributeValue;
  }
}
{
  /* <div id="ad" class=""></div> */
}
// 属性值的结束状态
function afterQuoteAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
    // 错误处理
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

// 没有引号包裹的属性值状态
function UnQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 当出现空格等间隔符号，表明属性值输入完毕
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == "\u0000") {
    // 错误处理
  } else if (c == '"' || c == "'" || c == "<" || c == "=" || c == "`") {
    // 错误处理
  } else if (c == EOF) {
    // 错误处理
  } else {
    currentAttribute += c;
    return UnQuotedAttributeValue;
  }
}

/* <img / */
// 用 isSelfClosing字段来区分标签是自封闭标签，还是普通结束标签。
function selfClosingStartTag(c) {
  if (c === ">") {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
    // 错误处理
  } else {
    // 错误处理
  }
}

// 解析HTML，传入 html 参数为一个 .html 结构，最终转化为 dom 树。
module.exports.parseHTML = function parseHTML(html) {
  // 初始化状态是 data 状态，所以 state 最初赋值为 data
  let state = data;
  // 遍历 html 中的每一个元素，html是一个 string 可遍历
  // 然后执行 state(c)，进入每一个状态；返回下一个状态，等待执行。
  // 每一个状态都是一个高阶函数，返回另一个状态函数。
  for (let c of html) {
    state = state(c);
  }
  // 文件的终结字符必须是唯一的，采用 EOF Symbol。
  state = state(EOF);

  console.log(stack);
};
