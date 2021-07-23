import React, { Component } from "react";
import "./App.less";
import Header from "./Components/Header";
import List from "./Components/List";
import Footer from "./Components/Footer";
import { Typography } from "antd";

export default class App extends Component {
  render() {
    const { Title } = Typography;
    return (
      <div className="container">
        <Title className="title" h={1} children="To do List" />
        <div className="todo-container">
          <Header />
          <List />
          <Footer />
        </div>
      </div>
    );
  }
}
