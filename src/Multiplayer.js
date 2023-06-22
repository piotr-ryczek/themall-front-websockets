import { useEffect, useState } from "react";
import { decodeToken } from "react-jwt";
import * as Colyseus from "colyseus.js";
import socketIOClient from "socket.io-client";

// ALSO EXPERIENCES!
function Multiplayer() {
  const [jwtToken, setJwtToken] = useState("");
  const [roomId, setRoomId] = useState("");
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
      console.error("connect_error", error);
    });

    socket.on("connect_error", (error) => {
      console.warn("Error", error);
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected");
    });

    socket.on("DAILY_ROOM_CREATED", (data) => {
      console.log("DAILY_ROOM_CREATED", data);
    });

    socket.on("DAILY_ROOM_REMOVED", (data) => {
      console.log("DAILY_ROOM_REMOVED", data);
    });
  }, [socket]);

  // Multiplayer (After connection to room)
  useEffect(() => {
    if (!room) return;

    room.onMessage("USER_JOINED_ROOM", (data) => {
      console.log("USER_JOINED_ROOM", data);
    });

    room.onMessage("GUEST_JOINED_ROOM", (data) => {
      console.log("GUEST_JOINED_ROOM", data);
    });

    room.onMessage("CHAT_MESSAGE", (data) => {
      console.log("CHAT_MESSAGE", data);
    });

    room.onMessage("USER_LEFT_ROOM", (data) => {
      console.log("USER_LEFT_ROOM", data);
    });

    room.onMessage("GUEST_LEFT_ROOM", (data) => {
      console.log("GUEST_LEFT_ROOM", data);
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
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDkzMGZhYWNjNDUwZGFjOTNjM2JkYTkiLCJ1c2VyVHlwZSI6IkVNQUlMIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjg3MzU5NDI0LCJleHAiOjE2ODc5NjQyMjR9._pT-ULSBA2GmRPDQeFQxNZ_tN7zK4BQnU80KPWfXidM"
    );
  };

  const handleSetToken2 = () => {
    setJwtToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDkzMGZhY2NjNDUwZGFjOTNjM2JkYWEiLCJ1c2VyVHlwZSI6IkVNQUlMIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNjg3MzU5NDMzLCJleHAiOjE2ODc5NjQyMzN9.iuwv6lLowInWg_uwHCCbRbyEa1taw88mlPVd4tn4-7U"
    );
  };

  const handleDisconnect = () => {
    client.close();
  };

  const handleConnectToRoom = async () => {
    try {
      const room = await client.joinById(roomId, {
        participantType: participantType,
        participantId: participantId,
      });

      setRoom(room);
    } catch (error) {
      console.error("Join Error", error);
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

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
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

      <h3>Połączenie do pokoju</h3>
      <input
        type="text"
        value={roomId}
        onChange={handleRoomIdChange}
        placeholder="roomId"
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

export default Multiplayer;
