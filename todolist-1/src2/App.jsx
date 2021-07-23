import React, { Component } from "react";
import Header from "./components/Header";
import List from "./components/List";
import Footer from "./components/Footer";
import "./App.css";

export default class App extends Component {
  // !!!核心：状态在哪里，操作状态的方法就在哪里。
  //初始化状态
  state = {
    todos: [
      { id: "001", name: "吃饭", done: false },
      { id: "002", name: "睡觉", done: false },
      { id: "003", name: "打代码", done: false },
    ],
  };

  // 用于添加一个todo，接受参数是一个todo对象
  addTodo = (todoObj) => {
    //获取原todos
    const { todos } = this.state;
    //加入新todo
    const newTodos = [todoObj, ...todos];
    //更新state
    this.setState({ todos: newTodos });
  };

  // 更新todo的对勾
  updateTodo = (id, done) => {
    // 获取现有的todos
    const { todos } = this.state;
    // 更新为新的todos
    const newTodos = todos.map((todoObj) => {
      if (todoObj.id === id) return { ...todoObj, done };
      else return todoObj;
    });

    // 更新state中的todos
    this.setState({
      todos: newTodos,
    });
  };

  //删除一个todo
  deleteTodo = (id) => {
    const { todos } = this.state;
    const newTodos = todos.filter((todoObj) => {
      return todoObj.id !== id;
    });
    this.setState({ todos: newTodos });
  };

  // 删除打勾的todos
  handleTitemsDelete = () => {
    const { todos } = this.state;
    const newTodos = todos.filter((todoObj) => {
      return todoObj.done === false;
    });
    this.setState({ todos: newTodos });
  };

  // 全选：
  checkAlltodo = (done) => {
    const { todos } = this.state;
    const newTodos = todos.map((todoObj) => {
      return { ...todoObj, done };
    });
    this.setState({ todos: newTodos });
  };

  render() {
    const { todos } = this.state;
    return (
      <div className="todo-container">
        <div className="todo-wrap">
          <Header addTodo={this.addTodo} />
          <List
            todos={todos}
            updateTodo={this.updateTodo}
            deleteTodo={this.deleteTodo}
          />
          <Footer
            todos={todos}
            handleTitemsDelete={this.handleTitemsDelete}
            checkAlltodo={this.checkAlltodo}
          />
        </div>
      </div>
    );
  }
}
