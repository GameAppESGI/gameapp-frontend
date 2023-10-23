import {useSelector} from "react-redux";
import Sidebar from "../home/components/Sidebar";
import React from "react";
import "./CreateRoom.css";
import {Dropdown} from 'primereact/dropdown';
import {InputText} from 'primereact/inputtext';
import {CreateNewChat} from "../../api-calls/chats";
import {StartGame} from "../../api-calls/games";
import {CreateGameRoom, JoinGameRoom} from "../../api-calls/gameRooms";
import {toast} from "react-hot-toast";

export function CreateRoom() {
    const {user} = useSelector((state) => state.userReducer);
    const [selectedGame, setSelectedGame] = React.useState("");
    const [nbrOfPlayers, setNbrOfPlayers] = React.useState("");
    const games = ["morpion", "game2"];
    const nbrOfPlayersList = ["1", "2", "3", "4", "5", "6", "7"]
    const [inputValue, setInputValue] = React.useState("");
    const data = [
        {
            title: (<div>
                <InputText value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
                <button onClick={() => joinGameRoom()} className="CreateButton">Join</button>
            </div>),
            field: "Join Room:",
        },
        {
            title: (<Dropdown value={selectedGame} onChange={(e) =>
                setSelectedGame(e.value)} options={games} placeholder="Select Game" className="w-full md:w-14rem"/>),
            field: "Game:",
        },
        {
            title: (<Dropdown value={nbrOfPlayers} onChange={(e) =>
                setNbrOfPlayers(e.value)} options={nbrOfPlayersList} placeholder="0" className="w-full md:w-14rem"/>),
            field: "Players:",
        },
        {
            title: (<InputText value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>),
            field: "Room Name:",
        },
    ];

    const createGameRoom = async () => {
        if(inputValue=== "") {
            toast.error("The room needs a name!");
            return
        }
        const createNewChatResponse = await CreateNewChat({members: [user._id], gameRoomChat: true});
        const newGame = {
            gameName: selectedGame,
            chat: createNewChatResponse.data._id,
            players: [user._id]
        }
        const createNewGameResponse = await StartGame(newGame);
        if(createNewGameResponse.success && createNewGameResponse.success) {
            console.log(createNewGameResponse.data._id);
            const newGameRoom = {
                name: inputValue,
                chat: createNewChatResponse.data._id,
                game: createNewGameResponse.data._id,
            };
            const createGameRoomResponse = await CreateGameRoom(newGameRoom);
            if(createGameRoomResponse.success) {
                toast.success("Game Room Created");
                setInputValue("");
                let newWindow = window.open("http://34.155.51.27/game-room","_blank")
                newWindow["gameRoom"] = createGameRoomResponse.data;
            }
            else {
                toast.error("Game Room Created");
                setInputValue("");
            }
        }
    }

    const joinGameRoom = async () => {
        const joinGameRoomResponse = await JoinGameRoom(inputValue, user._id);
        let newWindow = window.open("http://34.155.51.27/game-room","_blank")
        newWindow["gameRoom"] = joinGameRoomResponse.data;
    }

    return (
        user && <div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="Profile" className="rounded justify-center">
                <h1 id="ProfileTitle">Create New Game Room</h1>
                <div className="ProfileContainer">
                    <ul className="ProfileList">
                        {data.map((val, key) => {
                            return (
                                <li key={key} className="ProfileRow">
                                    <div id="field">{val.field}</div>
                                    <div id="title">
                                        <div className="flex">
                                            {val.title}
                                        </div>
                                    </div>
                                </li>);
                        })}
                    </ul>
                </div>
                <div className="flex justify-center pt-6"><button onClick={() => createGameRoom()} className="CreateButton">Create</button></div>
            </div>
        </div>
    );
}