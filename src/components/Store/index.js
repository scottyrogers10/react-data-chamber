import React, { Component } from "react";
import PropTypes from "prop-types";
import { produce } from "immer";
import Context from "../Context";
import { executeMutationAsync } from "../../helpers/mutations";
import { executeQueryAsync } from "../../helpers/queries";
import { executeUpdate } from "../../helpers/updates";
import { getInitializedTypes } from "../../helpers/initializers";
import shallowEqual from "../../helpers/shallowEqual";

class Store extends Component {
  constructor(props) {
    super();

    this.procedures = props.config.procedures;
    this.store = {
      getData: this._getData,
      getError: this._getError,
      getState: this._getState,
      isError: this._isError,
      isLoading: this._isLoading,
      isModified: this._isModified,
      isSaving: this._isSaving,
      process: this._process,
      queryAsync: this._queryAsync,
      resetToCachedData: this._resetToCachedData,
      resetToDefaultData: this._resetToDefaultData,
      resetToPreviousData: this._resetToPreviousData,
      saveAsync: this._saveAsync,
      setIsLoading: this._setIsLoading,
      syncData: this._syncData,
      update: this._update,
      _getSubscribers: this._getSubscribers,
      _subscribe: this._subscribe,
      _unsubscribe: this._unsubscribe
    };
    this.subscribers = [];
    this.types = getInitializedTypes(props.config.types);
  }

  _getData = typeName => {
    if (typeName) {
      return this.types[typeName].data;
    } else {
      return Object.keys(this.types).reduce((prevVal, currentTypeName) => {
        prevVal[currentTypeName] = this.types[currentTypeName].data;
        return prevVal;
      }, {});
    }
  };

  _getError = ({ reducer: reducerName, type: typeName }) => {
    const mutation = this.types[typeName].mutations[reducerName];
    const query = this.types[typeName].queries[reducerName];

    return mutation ? mutation.error : query.error;
  };

  _getState = typeName => {
    if (typeName) {
      return { ...this.types[typeName] };
    } else {
      return { ...this.types };
    }
  };

  _isError = options => {
    return this._getError(options) ? true : false;
  };

  _isLoading = ({ reducer: reducerName, type: typeName }) => {
    return this.types[typeName].queries[reducerName].isLoading;
  };

  _isModified = typeName => {
    return this.types[typeName].isModified;
  };

  _isSaving = ({ reducer: reducerName, type: typeName }) => {
    return this.types[typeName].mutations[reducerName].isSaving;
  };

  _process = ({ reducer: reducerName, type: typeName }, args) => {
    return this.procedures[typeName][reducerName](this.store, args);
  };

  _queryAsync = ({ reducer: reducerName, type: typeName }, reducerArgs) => {
    const queryOptions = {
      getState: this._getState,
      mode: this.props.mode,
      setTypes: this._setTypes,
      startTime: new Date().getTime(),
      typeName,
      reducerName,
      reducerArgs
    };

    return executeQueryAsync(queryOptions);
  };

  //Reset the data/previousData to the cached state.
  _resetToCachedData = typeName => {
    this._setTypes(
      produce(this.types, draft => {
        draft[typeName].isModified = false;
        draft[typeName].data = draft[typeName].cachedData;
        draft[typeName].previousData = draft[typeName].cachedData;
      })
    );

    this.props.mode === "development" &&
      console.log({
        action: "RESET_TO_CACHED_DATA",
        type: typeName,
        data: this._getData(typeName)
      });
  };

  //Reset the data/previousData/cachedData to the default state.
  _resetToDefaultData = typeName => {
    this._setTypes(
      produce(this.types, draft => {
        draft[typeName].isModified = false;
        draft[typeName].data = draft[typeName].defaultData;
        draft[typeName].previousData = draft[typeName].defaultData;
        draft[typeName].cachedData = draft[typeName].defaultData;
      })
    );

    this.props.mode === "development" &&
      console.log({
        action: "RESET_TO_DEFAULT_DATA",
        type: typeName,
        data: this._getData(typeName)
      });
  };

  //Reset the data to the previous state before the last update.
  _resetToPreviousData = typeName => {
    this._setTypes(
      produce(this.types, draft => {
        draft[typeName].data = draft[typeName].previousData;
      })
    );

    this.props.mode === "development" &&
      console.log({
        action: "RESET_TO_PREVIOUS_DATA",
        type: typeName,
        data: this._getData(typeName)
      });
  };

  _saveAsync = ({ reducer: reducerName, type: typeName }, reducerArgs) => {
    const mutationOptions = {
      getState: this._getState,
      mode: this.props.mode,
      setTypes: this._setTypes,
      startTime: new Date().getTime(),
      typeName,
      reducerName,
      reducerArgs
    };

    return executeMutationAsync(mutationOptions);
  };

  _setTypes = types => {
    this.types = types;
    this._updateConsumers();
  };

  _setIsLoading = ({ reducer: reducerName, type: typeName }) => {
    this._setTypes(
      produce(this.types, draft => {
        draft[typeName].queries[reducerName].isLoading = true;
        draft[typeName].queries[reducerName].error = null;
      })
    );

    this.props.mode === "development" &&
      console.log({
        action: "SET_IS_LOADING",
        type: typeName,
        reducer: reducerName,
        data: this._getData(typeName)
      });
  };

  _syncData = typeName => {
    this._setTypes(
      produce(this.types, draft => {
        draft[typeName].cachedData = draft[typeName].data;
        draft[typeName].previousData = draft[typeName].data;
      })
    );

    this.props.mode === "development" &&
      console.log({
        action: "SYNC_DATA",
        type: typeName,
        data: this._getData(typeName)
      });
  };

  _getSubscribers = () => {
    return this.subscribers;
  };

  _subscribe = wrappedInstance => {
    const storeToProps = wrappedInstance.mapStoreToProps(
      this.store,
      wrappedInstance.props
    );

    this.subscribers.push({ wrappedInstance, prevStoreToProps: storeToProps });
    wrappedInstance.forceUpdate();
  };

  _unsubscribe = wrappedInstance => {
    this.subscribers = this.subscribers.filter(
      subsciber => subsciber.wrappedInstance !== wrappedInstance
    );
  };

  _update = ({ reducer: reducerName, type: typeName }, reducerArgs) => {
    const updateOptions = {
      getState: this._getState,
      mode: this.props.mode,
      setTypes: this._setTypes,
      typeName,
      reducerName,
      reducerArgs
    };

    executeUpdate(updateOptions);
  };

  _updateConsumers() {
    this.subscribers.forEach(subscriber => {
      const wrappedInstance = subscriber.wrappedInstance;
      const storeToProps = wrappedInstance.mapStoreToProps(
        this.store,
        wrappedInstance.props
      );

      if (!shallowEqual(storeToProps, subscriber.prevStoreToProps)) {
        if (subscriber.wrappedInstance.mounted) {
          subscriber.prevStoreToProps = storeToProps;
          subscriber.wrappedInstance.forceUpdate();
        } else {
          this._unsubscribe(subscriber.wrappedInstance);
        }
      }
    });
  }

  componentDidMount() {
    if (this.props.mode === "development") {
      window.store = this.store;
    }
  }

  render() {
    return (
      <Context.Provider value={this.store}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

Store.propTypes = {
  config: PropTypes.object.isRequired,
  mode: PropTypes.string
};

Store.defaultProps = {
  mode: "production"
};

export default Store;
