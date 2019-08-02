import { produce } from "immer";
import debounceAsync from "./debounce";

const pendingRequests = {};

const setInitialState = ({ getState, setTypes, typeName, reducerName }) => {
    setTypes(
        produce(getState(), draft => {
            draft[typeName].mutations[reducerName].error = null;
            draft[typeName].mutations[reducerName].isSaving = true;
        })
    );
};

const setErrorStateAsync = (error, { getState, setTypes, startTime, typeName, reducerName }) => {
    const type = getState(typeName);
    const queryDelay = type.mutations[reducerName].delay;
    const setErrorState = resolve => {
        setTypes(
            produce(getState(), draft => {
                draft[typeName].mutations[reducerName].error = error;
                draft[typeName].mutations[reducerName].isSaving = false;
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

const setMutationStateAsync = ({
    getState,
    getData,
    mode,
    setTypes,
    typeName,
    startTime,
    reducerName,
    reducerArgs
}) => {
    const type = getState(typeName);
    const mutationDelay = type.mutations[reducerName].delay;
    const takeLast = type.mutations[reducerName].takeLast;
    const reducer = type.mutations[reducerName].reducer;

    pendingRequests[`MUTATION_${typeName}_${reducerName}`]
        ? pendingRequests[`MUTATION_${typeName}_${reducerName}`].push(startTime)
        : (pendingRequests[`MUTATION_${typeName}_${reducerName}`] = [startTime]);

    return reducer(getData(typeName), reducerArgs).then(data => {
        const endTime = new Date().getTime();
        const delay = mutationDelay - (endTime - startTime);
        const latestRequestTime = pendingRequests[`MUTATION_${typeName}_${reducerName}`].slice(-1)[0];

        const setMutationState = resolve => {
            if (latestRequestTime === startTime || !takeLast) {
                pendingRequests[`MUTATION_${typeName}_${reducerName}`] = [];

                setTypes(
                    produce(getState(), draft => {
                        draft[typeName].isModified = false;
                        draft[typeName].data = data;
                        draft[typeName].cachedData = data;
                        draft[typeName].mutations[reducerName].error = null;
                        draft[typeName].mutations[reducerName].isSaving = false;
                    })
                );

                resolve(data);
                mode === "development" && console.log({ action: "SAVE", type: typeName, reducer: reducerName, data });
            } else {
                resolve(type.data);
            }
        };

        return new Promise(resolve => {
            if (delay > 0) {
                setTimeout(() => {
                    setMutationState(resolve);
                }, delay);
            } else {
                setMutationState(resolve);
            }
        });
    });
};

const executeMutationAsync = mutationOptions => {
    setInitialState(mutationOptions);
    return debounceAsync(() => setMutationStateAsync(mutationOptions), "mutations", mutationOptions).catch(error => {
        return setErrorStateAsync(error, mutationOptions).then(() => {
            return Promise.reject(error);
        });
    });
};

export { executeMutationAsync };
