import { useEffect, useState } from "react";
import { decodeToken } from "react-jwt";
import * as Colyseus from "colyseus.js";
import socketIOClient from "socket.io-client";

const baseUrl = "http://localhost:3110/api/v1";

// ALSO EXPERIENCES!
function MultiplayerPublicSpaces() {
  const [jwtToken, setJwtToken] = useState("");
  const [roomType, setRoomType] = useState("");
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);
  const [room, setRoom] = useState(null);
  const [participantType, setParticipantType] = useState(null); // USER / GUEST
  const [participantId, setParticipantId] = useState(null); // UserId or GuestId

  // Experiences
  const [socket, setSocket] = useState(null);

  // Multiplayer
  useEffect(() => {
    if (!client) return;

    console.log("Multiplayer: Connected");
  }, [client]);

  // Experiences (After connection)
  useEffect(() => {
    if (!socket) return;

    console.log("Experiences: Connected");

    socket.on("connect_error", (error) => {
      console.error("EXPERIENCES", "connect_error", error);
    });

    socket.on("connect_error", (error) => {
      console.warn("EXPERIENCES", "Error", error);
    });

    socket.on("disconnect", () => {
      console.warn("EXPERIENCES", "Disconnected");
    });

    socket.on("DAILY_ROOM_CREATED", (data) => {
      console.log("EXPERIENCES", "DAILY_ROOM_CREATED", data);
    });

    socket.on("DAILY_ROOM_REMOVED", (data) => {
      console.log("EXPERIENCES", "DAILY_ROOM_REMOVED", data);
    });
  }, [socket]);

  // Multiplayer (After connection to room)
  useEffect(() => {
    if (!room) return;

    room.onMessage("USER_JOINED_ROOM", (data) => {
      console.log("MULTIPLAYER", "USER_JOINED_ROOM", data);
    });

    room.onMessage("GUEST_JOINED_ROOM", (data) => {
      console.log("MULTIPLAYER", "GUEST_JOINED_ROOM", data);
    });

    room.onMessage("CHAT_MESSAGE", (data) => {
      console.log("MULTIPLAYER", "CHAT_MESSAGE", data);
    });

    room.onMessage("USER_LEFT_ROOM", (data) => {
      console.log("MULTIPLAYER", "USER_LEFT_ROOM", data);
    });

    room.onMessage("GUEST_LEFT_ROOM", (data) => {
      console.log("MULTIPLAYER", "GUEST_LEFT_ROOM", data);
    });

    room.onLeave((data) => {
      console.log("MULTIPLAYER", "onLeave", data);
    });
  }, [room]);

  const handleSaveJwtToken = () => {
    const newSocket = socketIOClient("ws://localhost:3183/experiences", {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      },
    });

    setSocket(newSocket);

    const { userId, guestId } = decodeToken(jwtToken);

    const data = (() => {
      if (userId) {
        return {
          participantType: "USER",
          participantId: userId,
        };
      }

      if (guestId) {
        return {
          participantType: "GUEST",
          participantId: guestId,
        };
      }

      return null;
    })();

    if (!data) {
      throw new Error("There is no guest or user (in JWT)");
    }

    const { participantType, participantId } = data;

    setParticipantType(participantType);
    setParticipantId(participantId);

    const newClient = new Colyseus.Client("ws://localhost:3200");

    setClient(newClient);
  };

  const handleSetToken1 = () => {
    setJwtToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDkzMGZhYWNjNDUwZGFjOTNjM2JkYTkiLCJ1c2VyVHlwZSI6IkVNQUlMIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjg3NzEwMTc5LCJleHAiOjE2ODgzMTQ5Nzl9.-31BisUKiB2J9_8bidoLqSwzeqmmU0c9DayfGlZamYU"
    );
  };

  const handleSetToken2 = () => {
    setJwtToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDkzMGZhY2NjNDUwZGFjOTNjM2JkYWEiLCJ1c2VyVHlwZSI6IkVNQUlMIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjg3OTgxNjE3LCJleHAiOjE2ODg1ODY0MTd9.LCg7BvShvSDuepDLiSbRdVN7XPUnHyEQh_Rw9tAgq1E"
    );
  };

  const handleDisconnect = () => {
    client.close();
  };

  const handleConnectToRoom = async () => {
    try {
      const room = await client.joinOrCreate(roomType, {
        participantType,
        participantId,
        jwtToken,
      });

      setRoom(room);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = () => {
    const { id: clientId, sessionId } = client;

    room.send("CHAT_MESSAGE", {
      content: message,
      participantId,
      participantType,
      clientId,
      sessionId,
    });
  };

  // Text changes

  const handleJwtTokenChange = (event) => {
    setJwtToken(event.target.value);
  };

  const handleRoomTypeChange = (event) => {
    setRoomType(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  return (
    <>
      <h3>Nawiązanie połączenia (jednocześnie do Multiplayer i Experiences)</h3>
      <button type="button" onClick={handleSetToken1}>
        Ustaw token #1
      </button>
      <button type="button" onClick={handleSetToken2}>
        Ustaw token #2
      </button>
      <br />
      <hr />
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
      <br />

      <h3>Połączenie do pokoju (via RoomType)</h3>
      <input
        type="text"
        value={roomType}
        onChange={handleRoomTypeChange}
        placeholder="roomType"
      />
      <br />
      <button type="button" onClick={handleConnectToRoom}>
        Połącz do pokoju
      </button>
      <h3>Wysyłanie wiadomości</h3>
      <input
        type="text"
        value={message}
        onChange={handleMessageChange}
        placeholder="Message"
      />
      <button type="button" onClick={sendMessage}>
        Wyślij
      </button>
    </>
  );
}

export default MultiplayerPublicSpaces;
