import React, { Component } from "react";
import { Input } from "antd";

export default class Header extends Component {
  pressEnter = (event) => {
    console.log("输入的内容是:", event.target.value);
  };
  render() {
    return (
      <Input
        allowClear
        onPressEnter={this.pressEnter}
        placeholder="输入你要做的任务，按enter确认..."
      />
    );
  }
}
