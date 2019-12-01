import React from "react";
import ReactDOM from "react-dom";
import { Store } from "react-data-chamber";
import Main from "./components/Main";
import storeConfig from "./store";

ReactDOM.render(
  <Store mode={"development"} config={storeConfig}>
    <Main />
  </Store>,
  document.getElementById("root")
);
