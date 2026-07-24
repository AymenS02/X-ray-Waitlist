import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// how many x-ray techs changes wait time
// taking currently on display?
// how many patients are in the queue?
// patient doesnt answer call, what happens? remove from queue?