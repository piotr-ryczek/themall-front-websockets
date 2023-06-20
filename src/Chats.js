import { useEffect, useState } from "react";

import socketIOClient from "socket.io-client";

function Chats() {
  const [value, setValue] = useState("");
  const [chatId, setChatId] = useState("");
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

    socket.on("NEW_MESSAGE", (data) => {
      console.log("NEW_MESSAGE", data);
    });

    socket.on("SEND_MESSAGE", (data) => {
      console.log("SEND_MESSAGE", data);
    });

    socket.on("NEW_MESSAGE_IN_CHAT", (data) => {
      console.log("NEW_MESSAGE_IN_CHAT", data);
    });

    socket.on("CLIENT_CONNECTS", (data) => {
      console.log("CLIENT_CONNECTS", data);
    });

    socket.on("USER_DISCONNECTS", (data) => {
      console.log("USER_DISCONNECTS", data);
    });

    socket.on("JOIN_CHAT", (data) => {
      console.log("JOIN_CHAT", data);
    });

    socket.on("LEAVE_CHAT", (data) => {
      console.log("LEAVE_CHAT", data);
    });
  }, [socket]);

  const sendMessage = () => {
    socket.emit("SEND_MESSAGE", {
      message: value,
      chatId,
      sentDate: new Date(),
    });
    setValue("");
  };

  const handleLeave = () => {
    socket.emit("LEAVE_CHAT", {
      chatId,
    });
  };

  const handleJoin = () => {
    socket.emit("JOIN_CHAT", {
      chatId,
    });
  };

  const handleSaveJwtToken = () => {
    const newSocket = socketIOClient("ws://localhost:3181/rooms", {
      // 3180/chats
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

  const handleChatIdChange = (event) => {
    setChatId(event.target.value);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

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
      <hr />
      <h3>Dołączanie do pokoju i wysyłanie wiadomości</h3>
      <input
        type="text"
        value={chatId}
        onChange={handleChatIdChange}
        placeholder="ChatID"
      />
      <br />
      <button type="button" onClick={handleJoin}>
        Dołącz
      </button>
      <br />
      <button type="button" onClick={handleLeave}>
        Opuść
      </button>
      <hr />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="button" onClick={sendMessage}>
        Wysylaj
      </button>
    </>
  );
}

export default Chats;
