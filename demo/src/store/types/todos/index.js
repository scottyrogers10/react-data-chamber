import queries from "./queries";
// import updates from "./updates";

export default {
    name: "todos",
    type: "Array",
    description: "Collection of all todo items.",
    default: [],
    queries: {
        getTodos: {
            reducer: queries.getTodos,
            delay: 600,
            isLoading: true
        }
    }
};
