import React, { Component } from "react";
import { Button, Checkbox, Col } from "antd";
import "./index.css";

export default class Footer extends Component {
  deleteAll = () => {
    this.props.deleteAll();
  };

  checkedAll = (event) => {
    this.props.checkedAll(event.target.checked);
  };
  render() {
    const { todoArr } = this.props;
    const total = todoArr.length;
    const finished = todoArr.reduce(
      (prev, cur) => prev + (cur.done ? 1 : 0),
      0
    );
    return (
      <Col>
        <Checkbox
          className="footBox"
          checked={finished === total && total !== 0}
          onChange={this.checkedAll}
        >
          已完成 {finished} / 一共有 {total}
        </Checkbox>
        <Button
          className="deleteButton"
          type="primary"
          danger
          onClick={this.deleteAll}
        >
          清除已完成任务
        </Button>
      </Col>
    );
  }
}
