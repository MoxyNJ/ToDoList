import React, { Component } from "react";
import Item from "../Item";

export default class List extends Component {
  render() {
    const { todoArr, updateItem, deleteItem } = this.props;
    return (
      <div className="list">
        {todoArr.map((cur) => {
          return (
            <Item
              key={cur.id}
              {...cur}
              updateItem={updateItem}
              deleteItem={deleteItem}
            />
          );
        })}
      </div>
    );
  }
}
