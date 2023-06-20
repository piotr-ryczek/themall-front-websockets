import { useEffect, useState } from "react";

import socketIOClient from "socket.io-client";

function Friends() {
  const [jwtToken, setJwtToken] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socket) return;

    console.log("Connected");

    socket.on("connect_error", (error) => {
      console.error("connect_error", error);
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected");
    });

    socket.on("NEW_FRIEND_REQUEST", (data) => {
      console.log("NEW_FRIEND_REQUEST", data);
    });

    socket.on("FRIEND_REQUEST_ACCEPTED", (data) => {
      console.log("FRIEND_REQUEST_ACCEPTED", data);
    });

    socket.on("FRIEND_REQUEST_REJECTED", (data) => {
      console.log("FRIEND_REQUEST_REJECTED", data);
    });

    socket.on("FRIENDSHIP_REMOVED", (data) => {
      console.log("FRIENDSHIP_REMOVED", data);
    });
  }, [socket]);

  const handleSaveJwtToken = () => {
    const newSocket = socketIOClient("ws://localhost:3182/friends", {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      },
    });

    setSocket(newSocket);
  };

  const handleDisconnect = () => {
    socket.close();
  };

  // Text changes

  const handleJwtTokenChange = (event) => {
    setJwtToken(event.target.value);
  };

  return (
    <>
      <h3>Nawiązanie połączenia</h3>
      <input
        type="text"
        value={jwtToken}
        onChange={handleJwtTokenChange}
        placeholder="jwtToken"
      />
      <br />
      <button type="button" onClick={handleSaveJwtToken}>
        Połącz
      </button>
      <button type="button" onClick={handleDisconnect}>
        Rozłącz
      </button>
    </>
  );
}

export default Friends;
