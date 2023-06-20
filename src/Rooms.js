import { useEffect, useState } from "react";
import axios from "axios";

import socketIOClient from "socket.io-client";

const baseUrl = "http://localhost:3110/api/v1";

// export enum RoomsGatewayEventEnum {
//   NEW_GUEST_INVITATION_REQUEST = 'NEW_GUEST_INVITATION_REQUEST', // Guest is requesting to join Private Room Experience
//   GUEST_INVITATION_REQUEST_REJECTED = 'GUEST_INVITATION_REQUEST_REJECTED',
//   GUEST_INVITATION_REQUEST_ACCEPTED = 'GUEST_INVITATION_REQUEST_ACCEPTED',
//   USER_LEFT_ROOM = 'USER_LEFT_ROOM',
//   USER_REMOVED_FROM_ROOM = 'USER_REMOVED_FROM_ROOM',
//   USER_ADDED_TO_ROOM = 'USER_ADDED_TO_ROOM',
// }

function Rooms() {
  const [roomId, setRoomId] = useState("648b064f77a4eb008a51357d");
  const [secondRoomId, setSecondRoomId] = useState("648b064f77a4eb008a51357d");
  const [waitingListId, setWaitingListId] = useState("");
  const [name, setName] = useState("Piotr");
  const [invitationCode, setInvitationCode] = useState("");
  // const [value, setValue] = useState("");
  // const [chatId, setChatId] = useState("");
  const [jwtToken, setJwtToken] = useState("");

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socket) return;

    console.log("Connected");

    socket.on("connect_error", (error) => {
      console.error("connect_error", error);
    });

    socket.on("connect_error", (error) => {
      console.warn("Error", error);
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected");
    });

    socket.on("NEW_GUEST_INVITATION_REQUEST", (data) => {
      console.log("NEW_GUEST_INVITATION_REQUEST", data);
    });

    socket.on("GUEST_INVITATION_REQUEST_REJECTED", (data) => {
      console.log("GUEST_INVITATION_REQUEST_REJECTED", data);
    });

    socket.on("GUEST_INVITATION_REQUEST_ACCEPTED", (data) => {
      console.log("GUEST_INVITATION_REQUEST_ACCEPTED", data);
    });

    socket.on("USER_LEFT_ROOM", (data) => {
      console.log("USER_LEFT_ROOM", data);
    });

    socket.on("USER_REMOVED_FROM_ROOM", (data) => {
      console.log("USER_REMOVED_FROM_ROOM", data);
    });

    socket.on("USER_ADDED_TO_ROOM", (data) => {
      console.log("USER_ADDED_TO_ROOM", data);
    });
  }, [socket]);

  const handleRequestJoin = async () => {
    try {
      const url = `${baseUrl}/rooms/${roomId}/waitingList`;

      const headers = {};

      if (jwtToken) {
        Object.assign(headers, {
          Authorization: `Bearer ${jwtToken}`,
        });
      }

      const { data } = await axios.post(
        url,
        {
          name,
          invitationCode,
        },
        headers
      );

      const { token } = data;

      setJwtToken(token);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleSaveJwtToken = () => {
    const newSocket = socketIOClient("ws://localhost:3181/rooms", {
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

  const handleAcceptRequest = async () => {
    try {
      const url = `${baseUrl}/rooms/${secondRoomId}/waitingList/${waitingListId}/accept`;

      const { data } = await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log("handleAcceptRequest", data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleRejectRequest = async () => {
    try {
      const url = `${baseUrl}/rooms/${secondRoomId}/waitingList/${waitingListId}/reject`;

      const { data } = await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log("handleRejectRequest", data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  // Zmiany tekstowych pół

  const handleJwtTokenChange = (event) => {
    setJwtToken(event.target.value);
  };

  const handleWaitingListIdChange = (event) => {
    setWaitingListId(event.target.value);
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleInvitationCodeChange = (event) => {
    setInvitationCode(event.target.value);
  };

  const handleSecondRoomIdChange = (event) => {
    setSecondRoomId(event.target.value);
  };

  // const sendMessage = () => {
  //   socket.emit("sendMessage", {
  //     message: value,
  //     chatId,
  //   });
  //   setValue("");
  // };

  // const handleLeave = () => {
  //   socket.emit("leaveChat", {
  //     chatId,
  //   });
  // };

  // const handleJoin = () => {
  //   socket.emit("joinChat", {
  //     chatId,
  //   });
  // };

  return (
    <>
      <ol>
        <li>User: Utwórz pokój</li>
        <li>User: Wygeneruj kod zaproszenia</li>
        <li>
          Guest: Poproś o dołączenie do pokoju (z ID Zaproszenia, podanym
          imieniem i kodem zaproszenia)
        </li>
        <li>Guest: Po otrzymaniu odpowiedzi z tokenem nawiąż połączenie WS</li>
        <li>
          User: Po otrzymaniu via WebSocket informacji o nowym requeście via
          Rest zaakceptuj bądź odrzuć
        </li>
        <li>
          Guest: Po otrzymaniu informacji:
          <ul>
            <li>O odrzuceniu: zostałeś wyrzucony z pokoju, zamknij modal</li>
            <li>
              O akceptacji: nawiąż z tym samym tokenem połączenie do Colyseusa i
              3D
            </li>
          </ul>
        </li>
      </ol>

      <h3>Prośba o dołączenie do pokoju (Guest)</h3>
      <input
        type="text"
        value={roomId}
        onChange={handleRoomIdChange}
        placeholder="ID Pokoju"
      />
      <br />
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Imię"
      />
      <br />
      <input
        type="text"
        value={invitationCode}
        onChange={handleInvitationCodeChange}
        placeholder="Kod zaproszenia"
      />
      <br />
      <button type="button" onClick={handleRequestJoin}>
        Poproś o dołączenie do pokoju
      </button>
      <hr />
      <h3>Połączenie do WS (Guest & User)</h3>
      <input type="text" value={jwtToken} onChange={handleJwtTokenChange} />
      <br />
      <button type="button" onClick={handleSaveJwtToken}>
        Zapisz token i połącz
      </button>
      <hr />
      <h3>Akceptacja/Odrzucenie Prośby o dołączenie (User)</h3>
      <input
        type="text"
        value={secondRoomId}
        onChange={handleSecondRoomIdChange}
        placeholder="ID Pokoju"
      />
      <br />
      <input
        type="text"
        value={waitingListId}
        onChange={handleWaitingListIdChange}
        placeholder="ID Zaproszenia"
      />
      <br />
      <button type="button" onClick={handleAcceptRequest}>
        Zaakceptuj
      </button>
      <br />
      <button type="button" onClick={handleRejectRequest}>
        Odrzuć
      </button>

      {/* <input type="text" value={chatId} onChange={handleChatIdChange} />
      <br />
      <button type="button" onClick={handleJoin}>
        Dołącz
      </button>
      <br />
      <button type="button" onClick={handleLeave}>
        Opuść
      </button>
      <hr />
      <input type="text" value={value} onChange={handleChange} />
      <button type="button" onClick={sendMessage}>
        Wysylaj
      </button> */}
    </>
  );
}

export default Rooms;
