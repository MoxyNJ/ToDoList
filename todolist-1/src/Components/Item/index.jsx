import React, { Component } from "react";
import { Button, Checkbox, Col } from "antd";
import "./index.css";

export default class Item extends Component {
  state = { mouse: false };

  handleMouse = (event) => {
    if (event.type === "mouseleave") {
      this.setState({ mouse: false });
    } else {
      this.setState({ mouse: true });
    }
  };

  handleChecked = (id, done) => {
    return () => {
      this.props.updateItem(id, done);
    };
  };

  handleDelete = (id) => {
    return () => {
      this.props.deleteItem(id);
    };
  };

  render() {
    const { mouse } = this.state;
    const { id, event, done } = this.props;
    return (
      <Col
        span={24}
        className="item"
        onMouseLeave={this.handleMouse}
        onMouseEnter={this.handleMouse}
        style={{ backgroundColor: mouse ? "#ddd" : "white" }}
      >
        <Checkbox checked={done} onChange={this.handleChecked(id, done)}>
          {event}
        </Checkbox>
        <Button
          className="deleteItem"
          type="dashed"
          style={{ display: mouse ? "block" : "none" }}
          danger
          onClick={this.handleDelete(id)}
        >
          删除
        </Button>
      </Col>
    );
  }
}
