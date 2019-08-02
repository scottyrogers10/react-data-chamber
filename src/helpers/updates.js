import { produce } from "immer";

const executeUpdate = ({ getData, getState, mode, setTypes, typeName, reducerName, reducerArgs }) => {
    const type = getState(typeName);
    const reducer = type.updates[reducerName].reducer;
    const data = reducer(getData(typeName), reducerArgs);

    const updatedType = produce(type, draft => {
        draft.isModified = true;
        draft.data = data;
        draft.previousData = type.data;
    });

    setTypes(
        produce(getState(), draft => {
            draft[typeName] = updatedType;
        })
    );

    mode === "development" &&
        console.log({ action: "UPDATE", type: typeName, reducer: reducerName, data: updatedType.data });

    return data;
};

export { executeUpdate };
