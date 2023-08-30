import {useDispatch, useSelector} from "react-redux";
import {io} from "socket.io-client";
import {useEffect, useState} from "react";
import "./GameRoom.css";

export function GameRoom() {
    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.userReducer);
    const gameRoom = window["gameRoom"];
    const gameRoomSocket = io("http://localhost:3000/gameroom");
    const [connectedPlayers, setConnectedPlayers] = useState([]);

    useEffect(() => {
        if (user) {
            gameRoomSocket.emit("join-game-room", gameRoom._id, user.name);
            gameRoomSocket.on("connected", (players) => {
                console.log(players);
                setConnectedPlayers(players);
            });
        }
    }, [user]);

    return (user && <div className='gap-2 flex' id="body">
        <div className="SidePlayersContainer rounded">
            <ul className="SidePlayersList">
                {connectedPlayers && connectedPlayers.map((player, index) => {
                    return <li key={index} className="row">
                        {player}
                    </li>;
                })}
            </ul>
        </div>
        <div className="PartyContainer">
            <p>sal</p>
        </div>
    </div>);
}