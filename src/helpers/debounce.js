const debouncedTimeouts = {};

const debounceAsync = (promise, reducerType, { getState, typeName, reducerName }) => {
    const prevTimeout = debouncedTimeouts[`${typeName}_${reducerType}_${reducerName}`];
    const debounceDelay = getState(typeName)[reducerType][reducerName].debounce || 0;

    if (prevTimeout) {
        clearTimeout(prevTimeout);
    }

    return new Promise(resolve => {
        debouncedTimeouts[`${typeName}_${reducerType}_${reducerName}`] =
            debounceDelay > 0 ? setTimeout(() => resolve(promise()), debounceDelay) : resolve(promise());
    });
};

export default debounceAsync;
