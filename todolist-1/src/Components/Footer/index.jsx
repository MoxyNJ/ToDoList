import React, { Component } from "react";
import { Button, Checkbox, Col } from "antd";
import "./index.css";

export default class Footer extends Component {
  render() {
    return (
      <Col>
        <Checkbox className="footBox">已完成 0 / 一共有 3</Checkbox>
        <Button className="deleteButton" type="primary" danger>
          清除已完成任务
        </Button>
      </Col>
    );
  }
}
