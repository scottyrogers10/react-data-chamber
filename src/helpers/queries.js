import { produce } from "immer";
import debounceAsync from "./debounce";

const pendingRequests = {};

const setInitialState = ({ getState, setTypes, typeName, reducerName }) => {
    setTypes(
        produce(getState(), draft => {
            draft[typeName].queries[reducerName].error = null;
            draft[typeName].queries[reducerName].isLoading = true;
        })
    );
};

const setErrorStateAsync = (error, { getState, setTypes, startTime, typeName, reducerName }) => {
    const type = getState(typeName);
    const queryDelay = type.queries[reducerName].delay;
    const setErrorState = resolve => {
        setTypes(
            produce(getState(), draft => {
                draft[typeName].queries[reducerName].error = error;
                draft[typeName].queries[reducerName].isLoading = false;
            })
        );

        resolve();
    };

    return new Promise(resolve => {
        const endTime = new Date().getTime();
        const delay = queryDelay - (endTime - startTime);

        if (delay > 0) {
            setTimeout(() => {
                setErrorState(resolve);
            }, delay);
        } else {
            setErrorState(resolve);
        }
    });
};

const setQueryStateAsync = ({ getState, mode, setTypes, typeName, startTime, reducerName, reducerArgs }) => {
    const type = getState(typeName);
    const queryDelay = type.queries[reducerName].delay;
    const reducer = type.queries[reducerName].reducer;

    pendingRequests[`QUERY_${typeName}_${reducerName}`]
        ? pendingRequests[`QUERY_${typeName}_${reducerName}`].push(startTime)
        : (pendingRequests[`QUERY_${typeName}_${reducerName}`] = [startTime]);

    return reducer(type.data, reducerArgs).then(data => {
        const endTime = new Date().getTime();
        const delay = queryDelay - (endTime - startTime);
        const latestRequestTime = pendingRequests[`QUERY_${typeName}_${reducerName}`].slice(-1)[0];

        const setQueryState = resolve => {
            if (latestRequestTime === startTime) {
                pendingRequests[`QUERY_${typeName}_${reducerName}`] = [];

                setTypes(
                    produce(getState(), draft => {
                        draft[typeName].isModified = false;
                        draft[typeName].data = data;
                        draft[typeName].cachedData = data;
                        draft[typeName].queries[reducerName].error = null;
                        draft[typeName].queries[reducerName].isLoading = false;
                    })
                );

                resolve(data);
                mode === "development" && console.log({ action: "QUERY", type: typeName, reducer: reducerName, data });
            } else {
                resolve(type.data);
            }
        };

        return new Promise(resolve => {
            if (delay > 0) {
                setTimeout(() => {
                    setQueryState(resolve);
                }, delay);
            } else {
                setQueryState(resolve);
            }
        });
    });
};

const executeQueryAsync = queryOptions => {
    setInitialState(queryOptions);
    return debounceAsync(() => setQueryStateAsync(queryOptions), "queries", queryOptions).catch(error => {
        return setErrorStateAsync(error, queryOptions).then(() => {
            return Promise.reject(error);
        });
    });
};

export { executeQueryAsync };
