import React, { Component } from "react";
import { injectProps } from "react-data-chamber";
import Header from "./Header";
import Editor from "./Editor";
import styles from "./styles";

class Main extends Component {
  componentDidMount() {
    this.props.getTodos();
  }

  render() {
    return (
      <div style={{ ...styles.container, ...this.props.style }}>
        <Header />
        <Editor />
      </div>
    );
  }
}

const mapStoreToProps = store => {
  const actions = {
    getTodos: () => store.queryAsync({ reducer: "getTodos", type: "todos" })
  };

  return { ...actions };
};

export default injectProps(mapStoreToProps)(Main);
