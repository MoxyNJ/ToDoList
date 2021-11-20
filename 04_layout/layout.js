// 对style进行预处理：属性、类似px的属性，变成纯数字；转换字符串到数字类型等等。
function getStyle(element) {
  if (!element.style) element.style = {};

  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/))
      element.style[prop] = parseInt(element.style[prop]);
    if (element.style[prop].toString().match(/^[0-9\.]+$/))
      element.style[prop] = parseInt(element.style[prop]);
  }
  return element.style;
}

function layout(element) {
  // 如果没有 computedStyle 跳过
  if (!element.computedStyle) return;

  // 对style进行预处理：属性、类似px的属性，变成纯数字；转换字符串到数字类型等等。
  let elementStyle = getStyle(element);

  // 只处理 flex 排版
  if (elementStyle.display !== "flex") return;

  // 过滤并丢弃是文本节点的子节点
  let items = element.children.filter((e) => e.type === "element");

  //items.sort 是针对flex的order属性，进行排序。
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });

  let style = elementStyle;

  // 下面是主轴和交叉轴的处理
  // 把 width 和 height 的属性值是 空，auto，都转化为 null，方便后面判断。
  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  // 设置默认值
  if (!style.flexDirection || style.flexDirection === "auto")
    style.flexDirection = "row";
  if (!style.alignItems || style.alignItems === "auto")
    style.alignItems = "stretch";
  if (!style.justifyContent || style.justifyContent === "auto")
    style.justifyContent = "flex-start";
  if (!style.flexWrap || style.flexWrap === "auto") style.flexWrap = "nowrap";
  if (!style.alignContent || style.alignContent === "auto")
    style.alignContent = "stretch";

  // main 主轴
  // mainSize 主轴尺寸
  // mainStart， mainEnd 主轴的边界（包含了方向问题）
  // mainSign 表示从左往右排，从右往左排时的符号，正负1
  // mainBase 从左/从右开始
  // cross 交叉轴同理
  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;

  // 从左往右
  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  // 从右往左
  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  // 从上到下
  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  // 从下到上
  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  // flex容器的item如果太多会换行，同时新的一行会放到当前行的上面，而不是默认的下面
  if (style.flexWrap === "wrap-reverse") {
    [crossStart, crossEnd] = [crossEnd, crossStart];
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  /**
   * Layout 第二步：收集元素进行
   *
   */
  // 处理特殊情况：
  // 如果父元素没有设置主轴尺寸 那么那就进入AtuoMainSize模式
  // 父元素没有设置尺寸，就由子元素把父盒撑开
  let isAutoMainSize = false;
  if (!style[mainSize]) {
    // Auto sizing
    elementStyle[mainSize] = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.Style[mainSize] !== null || item.Style[mainSize] !== void 0)
        elementStyle[mainSize] = elementStyle[mainSize] + item.Style[mainSize];
    }
    isAutoMainSize = true;
  }

  // 行
  let flexLine = [];
  let flexLines = [flexLine];

  // 剩余空间，初始化为主轴尺寸
  let mainSpace = elementStyle[mainSize];
  let crossSpace = 0;

  // 遍历所有的 flex item，准备依次放入行中
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    // 属性值处理一下
    let itemStyle = getStyle(item);

    // 给主轴尺寸的默认值为0
    if (itemStyle[mainSize] === null) {
      itemStyle[mainSize] = 0;
    }

    // 如果有 flex 属性，就是可伸缩的，一定能放进该行中，则push进，不用计算剩余高度
    if (itemStyle.flex) {
      flexLine.push(item);
      // 如果是不允许换行，或者父元素是自动尺寸
    } else if (style.flexWrap === "nowrap" || isAutoMainSize) {
      // 先计算剩余高度，然后push进
      mainSpace -= itemStyle[mainSize];
      // 设置交叉轴高度(行高)，如果没有给交叉轴设置尺寸，行高就取最高的值
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      flexLine.push(item);
      // 换行：
    } else {
      // 如果主轴尺寸比子元素比主轴尺寸还大，就把它的尺寸压缩到主轴尺寸
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }
      // 如果主轴剩余空间不足以容纳子元素
      if (mainSpace < itemStyle[mainSize]) {
        // 确定当前行剩余的空间
        flexLine.mainSpace = mainSpace;
        flexline.crossSpace = crossSpace;

        // 创建一个新的行，然后放入该元素
        flexLine = [item];
        flexLines.push(flexLine);
        // 重置mainSpace和crossSpace剩余空间的属性，一遍开始新的计算
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        // 剩余空间能容纳子元素，直接放进去
        flexLine.push(item);
      }
      // 计算交叉轴的尺寸（行高）
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);

      // 计算主轴的尺寸（剩余空间）
      // 执行到这来，子item肯定放入了理想的行中，把行的剩余空间计算出来
      mainSpace -= itemStyle[mainSize];
    }
  }
  // 循环结束，元素已经没了。于是在这里给最后一行添加上尺寸
  flexLine.mainSpace = mainSpace;

  /**
   * Layout 第三步：计算主轴的方向
   *
   */
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  // 如果剩余空间小于零，对所有元素进行等比压缩。
  // 如果小于零，表明元素肯定能压缩，所以这个flex只有一行
  if (mainSpace < 0) {
    //overflow单行 所有元素进行等比压缩
    // style[mainSize]容器的主轴尺寸，mainSpace超出来的空间，相减就是目前的总尺寸（大于容器尺寸）
    let scale = style[mainSize] / (style[mainSize] - mainSpace);
    // mainBase确定开始的方向，（从0 ---> mainSize）
    // mainSign确定正负值
    let currentMain = mainBase;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      // flex属性的元素定义了压缩比例，则不参与等比例压缩
      // 这里只实现了等比例压缩，所以暂时不考虑自定义比例压缩
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      // 对有尺寸的元素，进行等比压缩
      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      // 确定元素的位置，start 和 end
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
    // 不能压缩，就肯定是多行，且每行一定有 >= 0 的剩余空间需要安排
    // 剩余空间会优先安排给有 flex 属性，定义了压缩/拉伸比例的子元素，按照比例分给他们;
    // 如果没有 flex 属性的子元素，就把剩余空间放在主轴的 左边/中间/右边 即可
  } else {
    // 遍历fliexLines中的每一行 flexLine
    flexLines.forEach(function (items) {
      // 获取当前行的剩余空间
      let mainSpace = items.mainSpace;
      // 记录该行可以参与 flex 拉伸的子元素总数
      let flexTotal = 0;

      // 遍历每行的flex item
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        // 如果该flex item 是一个普通的 item ，参与 flex 子元素布局，就把flexTotal总数加一
        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }
      // 如果大于零，表示有拉伸的子元素可以消耗掉剩余空间，把剩余空间都平均分给他们
      if (flexTotal > 0) {
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          // 这里的算法存疑？？？
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          // 每个元素的开始位置，和结束位置
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
        // 没有 可伸缩的子元素，就把剩余空间按照 justifyContent 属性集中分配：
      } else {
        let currentMain = null;
        let step = null;
        // 从左向右排
        if (style.justifyContent === "flex-start") {
          currentMain = mainBase;
          step = 0;
        }
        // 从右向左排
        if (style.justifyContent === "flex-end") {
          currentMain = mainSpace * mainSign + mainBase;
          step = 0;
        }
        // 元素居中，左右各留一半
        if (style.justifyContent === "center") {
          currentMain = (mainSpace / 2) * mainSign + mainBase;
          step = 0;
        }
        // 所有元素之间等比例间隔
        if (style.justifyContent === "space-between") {
          // 元素间有间隔，间隔的总数就是 items.length - 1
          step = (mainSpace / (items.length - 1)) * mainSign;
          currentMain = mainBase;
        }
        // 每个元素两遍都有相同的空白，这意味着主轴两端的空白是元素之间的空白的一半
        if (style.justifyContent === "space-around") {
          step = (mainSpace / items.length) * mainSign;
          currentMain = step / 2 + mainBase;
        }
        // 元素之间、主轴两端的空白尺寸完全相同
        if (style.justifyContent === "space-evenly") {
          step = (mainSpace / (items.length + 1)) * mainSign;
          currentMain = step + mainBase;
        }

        // 计算好后，进行排版
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  /**
   *  第四步：交叉轴的计算：
   *  容器的交叉轴剩余尺寸
   */
  // 如果容器元素没写交叉轴尺寸
  {
    if (!style[crossSize]) {
      // crossSpace永远为0，遍历子元素：容器的交叉轴尺寸 == 各行交叉轴尺寸之和
      crossSpace = 0;
      elementStyle[crossSize] = 0;
      for (let i = 0; i < flexLines.length; i++) {
        elementStyle[crossSize] =
          elementStyle[crossSize] + flexLines[i].crossSpace;
      }
    } else {
      // 交叉轴剩余的高度 = 容器交叉轴尺寸 - 每一行的高度
      crossSpace = style[crossSize];
      for (let i = 0; i < flexLines.length; i++) {
        crossSpace -= flexLines[i].crossSpace;
      }
    }

    // 处理flex-wrap，如果是wrap-reverse，则行会从容器的底部往上排序。
    if (style.flexWrap === "wrap-reverse") {
      crossBase = style[crossSize];
    } else {
      crossBase = 0;
    }
    // 根据 alignContent 分配行高的剩余空间，确定每行的位置
    // 一共有几行 = 总交叉轴尺寸 / 行数量
    let lineSize = style[crossSize] / flexLines.length;
    let step = null;

    if (style.alignContent === "flex-start") {
      crossBase += 0;
      step = 0;
    }

    if (style.alignContent === "flex-end") {
      crossBase += crossSign * crossSpace;
      step = 0;
    }

    if (style.alignContent === "center") {
      crossBase += (crossSign * crossSpace) / 2;
      step = 0;
    }

    if (style.alignContent === "space-between") {
      crossBase += 0;
      step = crossSpace / (flexLines.length - 1);
    }

    if (style.alignContent === "space-around") {
      step = crossSpace / flexLines.length;
      crossBase += (crossSign * step) / 2;
    }

    if (style.alignContent === "stretch") {
      crossBase += 0;
      step = 0;
    }
    // 处理 algin-items 和 align-self，确定每个元素在每行里的位置
    flexLines.forEach((items) => {
      // lineCrossSize 是该行的交叉轴行高，
      // 如果是 stretch 就按比例填满，不是就在每行上学分配 crossSpace 剩余空间
      let lineCrossSize =
        style.alignContent === "stretch"
          ? items.crossSpace + crossSpace / flexLines.length
          : items.crossSpace;

      // 遍历每个元素
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        // self 的优先级更高，指定的范围更小。
        let align = itemStyle.alignSelf || style.alignItems;

        // 如果这个item没有交叉轴尺寸，就根据 stretch属性来判断是直接拉伸满，还是 0
        if (itemStyle[crossSize] === null)
          itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;

        if (align === "flex-start") {
          itemStyle[crossStart] = crossBase;
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize];
        }
        if (align === "flex-end") {
          itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
          itemStyle[crossStart] =
            itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
        }

        if (align === "center") {
          itemStyle[crossStart] =
            crossBase +
            (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize];
        }

        if (align === "stretch") {
          itemStyle[crossStart] = crossBase;
          itemStyle[crossEnd] =
            crossBase +
            crossSign *
              (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0
                ? itemStyle[crossSize]
                : lineCrossSize);
          itemStyle[crossSize] =
            crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
        }
      }
      crossBase += crossSign * (lineCrossSize + step);
    });
    console.log(items + "cross");
  }
}

module.exports = layout;
