import React from "react";
import ReactDOM from "react-dom";
import "./app.scss";
import { SandboxAsyncFlow } from "./SandboxAsyncFlow";

ReactDOM.render(
  <React.StrictMode>
    <SandboxAsyncFlow />
  </React.StrictMode>,
  document.getElementById("root"),
);
