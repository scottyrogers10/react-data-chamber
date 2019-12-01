import React from "react";
import { injectProps } from "react-data-chamber";
import TodosList from "./TodosList";
import styles from "./styles";

const Editor = props => {
  return (
    <div style={{ ...styles.container, ...props.style }}>
      <TodosList />
    </div>
  );
};

const mapStoreToProps = store => {
  const data = {
    isLoading: store.isLoading({ reducer: "getTodos", type: "todos" })
  };

  return { ...data };
};

export default injectProps(mapStoreToProps)(Editor);
