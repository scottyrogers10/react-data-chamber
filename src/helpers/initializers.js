const getDefaultDataByType = type => {
    const typeMap = {
        OBJECT: {},
        NULL: null,
        ARRAY: [],
        STRING: "",
        NUMBER: 0,
        BOOLEAN: false
    };

    const defaultData = typeMap[type.toLocaleUpperCase()];
    return defaultData === undefined ? null : defaultData;
};

const getDefaultData = typeConfig => {
    if (typeConfig.default === undefined) {
        return typeConfig.type !== undefined ? getDefaultDataByType(typeConfig.type) : null;
    } else {
        return typeConfig.default;
    }
};

const getInitializedQueries = (queries = {}) => {
    return Object.keys(queries).reduce((prevVal, currentQueryName) => {
        const query = queries[currentQueryName];

        prevVal[currentQueryName] = {
            delay: 0,
            error: null,
            isLoading: false,
            ...query
        };

        return prevVal;
    }, {});
};

const getInitializedMutations = (mutations = {}) => {
    return Object.keys(mutations).reduce((prevVal, currentMutationName) => {
        const mutation = mutations[currentMutationName];

        prevVal[currentMutationName] = {
            delay: 0,
            error: null,
            takeLast: true,
            isSaving: false,
            ...mutation
        };

        return prevVal;
    }, {});
};

const getInitializedUpdates = (updates = {}) => {
    return Object.keys(updates).reduce((prevVal, currentUpdateName) => {
        const update = updates[currentUpdateName];

        prevVal[currentUpdateName] = {
            ...update
        };

        return prevVal;
    }, {});
};

const getInitializedTypes = types => {
    return Object.keys(types).reduce((prevVal, currentTypeName) => {
        const typeConfig = types[currentTypeName];
        const defaultData = getDefaultData(typeConfig);

        prevVal[currentTypeName] = {
            cachedData: defaultData,
            data: defaultData,
            defaultData: defaultData,
            previousData: defaultData,
            isModified: false,
            queries: getInitializedQueries(typeConfig.queries),
            mutations: getInitializedMutations(typeConfig.mutations),
            updates: getInitializedUpdates(typeConfig.updates)
        };

        return prevVal;
    }, {});
};

export { getInitializedTypes };
