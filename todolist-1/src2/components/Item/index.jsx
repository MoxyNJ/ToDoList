import React, { Component } from "react";
import "./index.css";

export default class Item extends Component {
  state = {
    mouse: false,
  };

  //鼠标出入的回调
  handleMouse = (flag) => {
    return () => {
      this.setState({ mouse: flag });
    };
  };

  // 勾选的回调
  handleCheck = (id) => {
    return (event) => {
      this.props.updateTodo(id, event.target.checked);
    };
  };

  // 删除一个todo的回调
  handleDelete = (id) => {
    return () => {
      if (window.confirm("确定要删除吗？")) {
        this.props.deleteTodo(id);
      }
    };
  };

  render() {
    const { id, name, done } = this.props;
    const { mouse } = this.state;

    return (
      <li
        style={{ backgroundColor: mouse ? "#ddd" : "white" }}
        onMouseLeave={this.handleMouse(false)}
        onMouseEnter={this.handleMouse(true)}
      >
        <label>
          <input
            type="checkbox"
            checked={done}
            onChange={this.handleCheck(id)}
          />
          <span>{name}</span>
        </label>
        <button
          onClick={this.handleDelete(id)}
          className="btn btn-danger"
          style={{ display: mouse ? "block" : "none" }}
        >
          删除
        </button>
      </li>
    );
  }
}
