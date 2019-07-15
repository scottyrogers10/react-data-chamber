import React from "react";
import { injectStoreProps } from "react-data-chamber";
import styles from "./styles";

const Header = props => {
    return (
        <div style={{ ...styles.container, ...props.style }}>
            <span style={styles.title}>Todos</span>
            <span>{props.total > 0 && `(${props.total})`}</span>
        </div>
    );
};

const mapStoreToProps = store => {
    const data = {
        total: store.getData("todos").length
    };

    return { ...data };
};

export default injectStoreProps(mapStoreToProps)(Header);
