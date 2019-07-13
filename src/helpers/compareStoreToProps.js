const compareStoreToProps = (currentStoreToProps, prevStoreToProps) => {
    return Object.keys(currentStoreToProps).every(key => {
        if (typeof currentStoreToProps[key] === "function") {
            return true;
        }

        return currentStoreToProps[key] === prevStoreToProps[key];
    });
};

export default compareStoreToProps;
