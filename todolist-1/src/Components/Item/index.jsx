import React, { Component } from "react";
import { Button, Checkbox, Col } from "antd";
import "./index.css";

export default class Item extends Component {
  render() {
    return (
      <Col span={24} className="item">
        <Checkbox>吃饭</Checkbox>
        <Button className="deleteItem" type="primary" danger>
          删除
        </Button>
      </Col>
    );
  }
}
