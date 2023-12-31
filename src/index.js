import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Chats from "./Chats";
import Rooms from "./Rooms";
import Friends from "./Friends";
import MultiplayerPublicSpaces from "./MultiplayerPublicSpaces";
import MultiplayerPrivateRooms from "./MultiplayerPrivateRooms";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MultiplayerPrivateRooms />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
