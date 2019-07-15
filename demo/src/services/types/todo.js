import mockTodos from "../../mocks/todos";

export default {
    getTodosAsync: () => {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockTodos), 500);
        });
    }
};
