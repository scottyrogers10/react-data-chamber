import React, { Component } from "react";
import { equals } from "ramda";
import Context from "./Context";

const injectStoreProps = (mapStoreToProps, configs = {}) => {
    return WrappedComponent => {
        class InjectStoreProps extends Component {
            constructor() {
                super();
                this.mounted = true;
                this.mapStoreToProps = mapStoreToProps;
            }

            shouldComponentUpdate(prevProps) {
                if (configs.shouldDeepCheck) {
                    return !equals(prevProps, this.props);
                }
            }

            componentDidMount() {
                this.props.store._subscribe(this);
            }

            componentWillUnmount() {
                this.mounted = false;
                this.props.store._unsubscribe(this);
            }

            render() {
                return <WrappedComponent {...this.props} {...mapStoreToProps(this.props.store, this.props)} />;
            }
        }

        const ContextWrapper = props => {
            return (
                <Context.Consumer>
                    {store => {
                        return <InjectStoreProps {...props} store={store} />;
                    }}
                </Context.Consumer>
            );
        };

        return ContextWrapper;
    };
};

export default injectStoreProps;
