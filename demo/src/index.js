import React from "react";
import ReactDOM from "react-dom";
import { DataChamber } from "react-data-chamber";
import Main from "./components/Main";
import storeConfig from "./store";

ReactDOM.render(
    <DataChamber mode={"development"} config={storeConfig}>
        <Main />
    </DataChamber>,
    document.getElementById("root")
);
