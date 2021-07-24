import React, { Component } from "react";
import { Input } from "antd";
import "./index.css";

export default class Header extends Component {
  pressEnter = (event) => {
    this.props.addItem(event.target.value);
    this.inputValue.state.value = "";
  };

  render() {
    return (
      <div className="header">
        <Input
          ref={(e) => (this.inputValue = e)}
          allowClear
          onPressEnter={this.pressEnter}
          placeholder="输入你要做的任务，按enter确认...."
        />
      </div>
    );
  }
}
