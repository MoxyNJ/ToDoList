const images = require("images");

function render(viewport, element) {
  // 收到一个元素后，就创建一个对应尺寸的 imgage
  if (element.style) {
    let img = images(element.style.width, element.style.height);

    // 背景色的解析
    if (element.style["background-color"]) {
      let color = element.style["background-color"] || "rgb(0,0,0)";
      // 提取背景色
      color.match(/rgb\((\d+),(\d+),(\d+)\)/);
      // img 的 API
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3), 1);
      // 绘制到总画面的左上角
      viewport.draw(img, element.style.left || 0, element.style.top || 0);
    }
  }

  // 添加递归，如果当前元素还有子元素，就继续对子元素进行渲染
  if (element.children) {
    for (let child of element.children) {
      render(viewport, child);
    }
  }
}

module.exports = render;
