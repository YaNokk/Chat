import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/antd.css";
import "./styles/index.scss";
import { Routing } from "./routing/Router";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Routing />);
