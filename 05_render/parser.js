const css = require("css");
const EOF = Symbol("EOF"); // 文件终结符号，唯一

const layout = require("./layout.js");

// 状态解析区
let currentToken = null; // 标签 token
let currentAttribute = null; // 属性 token

// emit 区
// 利用 stack 结构解析 DOM 树
let stack = [{ type: "document", children: [] }];
let currentTextNode = null; // emit中的文本节点

// 对CSS规则进行处理
let rules = [];
// 获取 CSS 规则
function addCSSRules(text) {
  // css库提供的方法，直接转化为 ast
  let ast = css.parse(text);
  // console.log(JSON.stringify(ast, null, "  "));
  // 只需要 ast 中的 rules 属性内保存的规则。
  rules.push(...ast.stylesheet.rules);
}

// CSS的第七步：计算CSS规则的权重值specificity
function specificity(selector) {
  //用一个数组统计权重
  let p = [0, 0, 0, 0];
  //假设CSS规则：body div #id {...}
  let selectorParts = selector.split(" ");

  // 三种情况：id选择器、class选择器、tagName选择器
  for (let part of selectorParts) {
    if (part.charAt(0) === "#") {
      p[1] += 1;
    } else if (part.charAt(0) === ".") {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

// CSS的第七步：当对元素加入CSS规则时，比较优先级specificity
// 如果高位能比出结果，就直接return；
// 如果全部一样，新的CSS规则覆盖旧的CSS规则
function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) return sp1[0] - sp2[0];
  if (sp1[1] - sp2[1]) return sp1[1] - sp2[1];
  if (sp1[2] - sp2[2]) return sp1[2] - sp2[2];

  return sp1[3] - sp2[3];
}

// 比较匹配算法
// .a / #a / a: id选择器/class选择器/tagName选择器
function match(element, selector) {
  // 如果当前element没有属性名称，
  if (!selector || !element || !element.attributes) return false;

  //  当selector是id选择器，就在element利用find找到对应id的name和value
  if (selector.charAt(0) == "#") {
    let attr = element.attributes.find((attr) => attr.name === "id");
    if (attr && attr.value === selector.replace("#", "")) return true;
    //  当selector是class选择器，就在element利用find找到对应class的name和value
  } else if (selector.charAt(0) == ".") {
    let attr = element.attributes.find((attr) => attr.name === "class");

    // 处理 class 属性中带空格的情况，有可能element中有多个class value
    // \s 匹配任何空白字符，包括空格、制表符、换页符
    let className =
      (attr &&
        attr.value &&
        attr.value.split(/\s+/).filter((item) => !!item)) ||
      [];
    if (className.includes(selector.replace(".", ""))) return true;
    // if (attr && attr.value === selector.replace(".", "")) return true;

    // 如果不是 id 和 class，那就是通过标签名去判断
  } else {
    if (element.tagName === selector) {
      return true;
    }
  }
  // 如果上面三个情况都不满足，肯定没匹配上，return false
  return false;
}

// 计算 CSS 规则
function computeCSS(element) {
  // stack是不断变化的，利用 slice 浅拷贝一份，concat 也行
  // reverse 是从当前元素开始往外层匹配的，所以要翻转一下
  let elements = stack.slice().reverse();
  // computedStyle 保存 CSS 应用的属性
  if (!element.computedStyle) element.computedStyle = {};

  /* div span { ... }*/
  for (let rule of rules) {
    // 从截图可以看出，rule.selectors 保存了选择器内容
    // 选择器不考虑逗号分割，同时给多个元素应用规则，所以只看 selectors[0]
    // 这里只关注选择器的空格情况，所以用 split 分割空格。
    // reverse 要反转，从当前元素开始匹配。
    for (const item of rule.selectors) {
      // let selectorParts = rule.selectors[0].split(" ").reverse();
      let selectorParts = item.split(" ").reverse();

      if (!match(element, selectorParts[0])) continue;

      // 嘉假定匹配失败
      let matched = false;

      // 这里要双循环，匹配：
      // 元素-->父元素-->祖父元素，嵌套关系是否和当前 CSS 选择器的嵌套关系相同。

      // j：当前选择器的位置，从1开始（第0个选择器是匹配的，已经处理了。
      //    后续的父选择器只要匹配元素父元素列表中的某个即可。
      // i: 当前元素的位置
      let j = 1;

      for (let i = 0; i < elements.length; i++) {
        // 一旦匹配成功，就自增 j
        if (match(elements[i], selectorParts[j])) {
          j++;
        }
      }

      // 如果 j 全部匹配成功，则该CSS规则匹配成功
      if (j >= selectorParts.length) {
        matched = true;
      }

      // 这里实现第六步，生成 computed 属性
      /** declarations 保存了该条 CSS 的具体规则：
       * "declarations": [
            {
                "type": "declaration",
                "property": "padding",
                "value": "0",
            },
            {
                "type": "declaration",
                "property": "margin",
                "value": "0",
            }
        ],
       * 
       */
      if (matched) {
        // 拿到当前CSS规则的specificity（优先级）值
        let sp = specificity(rule.selectors[0]);
        let computedStyle = element.computedStyle;
        // 循环遍历，取declarations里面的内容，依次赋值
        for (let declaration of rule.declarations) {
          // 对比元素原有的computedStyle中是否有该属性名，
          // 如果没有就新建一个
          if (!computedStyle[declaration.property])
            computedStyle[declaration.property] = {};

          // 满足两个条件之一，就写入新的CSS规则的值和优先级数：
          //  1. 如果元素之前没有这个CSS规则
          //  2. 如果新的CSS规则的优先级比旧的更高（或者相等）
          if (
            !computedStyle[declaration.property].specificity ||
            compare(computedStyle[declaration.property].specificity, sp) <= 0
          ) {
            computedStyle[declaration.property].value = declaration.value;
            computedStyle[declaration.property].specificity = sp;
          }
        }
      }
    }
  }
}

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

    // starTag 时 已经获取了这个元素的全部 CSS 属性：
    // style 中的CSS规则放在最开头，已经全部录入
    // 当前元素的属性名和属性值已经获取，可以去查找 CSS 规则了
    // 对 CSS 规则进行计算
    computeCSS(element);

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
      // --------- 遇到 style 标签时，执行添加CSS规则的操作 -------------//
      if (top.tagName === "style") {
        // 当前，top是style，children[0]是文本节点，content是CSS内容
        addCSSRules(top.children[0].content);
      }

      // 如果此时token为结束标签，表明该元素的所有信息已经获取完毕，
      // 可以对这个元素进行layout排版了。
      layout(top);

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
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
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
  return stack[0];
};
