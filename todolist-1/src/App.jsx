import React, { Component } from "react";
import { nanoid } from "nanoid";
import Header from "./Components/Header";
import List from "./Components/List";
import Footer from "./Components/Footer";
import { Typography } from "antd";
import "./App.less";

export default class App extends Component {
  state = {
    todoArr: [
      {
        id: "001",
        event: "吃饭",
        done: true,
      },
      {
        id: "002",
        event: "睡觉",
        done: false,
      },
      {
        id: "003",
        event: "敲代码",
        done: true,
      },
    ],
  };

  addItem = (event) => {
    console.log(event);
    const { todoArr } = this.state;
    let newTodoArr = [{ id: nanoid(), event: event, done: false }, ...todoArr];
    this.setState({ todoArr: newTodoArr });
  };

  updateItem = (id, done) => {
    const { todoArr } = this.state;
    let newTodoArr = todoArr.map((cur) => {
      if (cur.id === id) {
        cur.done = !done;
      }
      return cur;
    });
    this.setState({ todoArr: newTodoArr });
  };
  deleteItem = (id) => {
    const { todoArr } = this.state;
    let newTodoArr = todoArr.filter((cur) => {
      return cur.id !== id;
    });
    this.setState({ todoArr: newTodoArr });
  };

  deleteAll = () => {
    const { todoArr } = this.state;
    let newTodoArr = todoArr.filter((cur) => {
      return cur.done === false;
    });
    this.setState({ todoArr: newTodoArr });
  };

  checkedAll = (checked) => {
    const { todoArr } = this.state;
    let newTodoArr = todoArr.map((cur) => {
      if (cur.done !== checked) cur.done = checked;
      return cur;
    });
    this.setState({ todoArr: newTodoArr });
  };

  render() {
    const { Title } = Typography;
    const { todoArr } = this.state;

    return (
      <div className="container">
        <Title className="title" level={1} children="To do List" />
        <Title className="subtitle" level={5} children="数据全部放在 App 中" />
        <div className="todo-container">
          <Header addItem={this.addItem} />
          <List
            todoArr={todoArr}
            updateItem={this.updateItem}
            deleteItem={this.deleteItem}
          />
          <Footer
            todoArr={this.state.todoArr}
            deleteAll={this.deleteAll}
            checkedAll={this.checkedAll}
          />
        </div>
      </div>
    );
  }
}
