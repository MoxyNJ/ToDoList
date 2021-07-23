import React, { Component } from "react";
import Item from "../Item";
import "./index.css";

export default class List extends Component {
  render() {
    return (
      <div>
        <Item />
        <Item />
        <Item />
      </div>
    );
  }
}
