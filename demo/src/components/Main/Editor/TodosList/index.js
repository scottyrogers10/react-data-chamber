import React from "react";
import styles from "./styles";

const TodosList = props => {
    return <div style={{ ...styles.container, ...props.style }}>List</div>;
};

export default TodosList;
