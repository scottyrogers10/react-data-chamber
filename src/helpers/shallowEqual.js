const hasOwn = Object.prototype.hasOwnProperty;

const is = (keyA, keyB) => {
    if (typeof keyA === "function") {
        return true;
    } else {
        return keyA === keyB;
    }
};

export default (objA, objB) => {
    if (is(objA, objB)) return true;

    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
            return false;
        }
    }

    return true;
};
