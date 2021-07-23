import React, { Component } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";
import "./index.css";

//nanoid 全球唯一的字符串

export default class Header extends Component {
  // 对接收的props进行：类型，必要性的限制
  static propTupes = {
    addTodo: PropTypes.func.isRequired,
  };

  handleKeyUp = (event) => {
    const { keyCode, target } = event;
    // 判断回车 + 输入为空
    if (keyCode !== 13 || target.value.trim() === "") return;
    // 准备新的todo对象
    const todoObj = { id: nanoid(), name: target.value, done: false };

    // 新的todo对象传递给Add
    this.props.addTodo(todoObj);
    // 清空输入
    target.value = "";
  };

  render() {
    return (
      <div className="todo-header">
        <input
          onKeyUp={this.handleKeyUp}
          type="text"
          placeholder="请输入你的任务名称，按回车键确认"
        />
      </div>
    );
  }
}
