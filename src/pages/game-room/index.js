import {useDispatch, useSelector} from "react-redux";
import {io} from "socket.io-client";
import React, {useEffect, useState} from "react";
import "./GameRoom.css";
import * as Icon from "react-bootstrap-icons";
import EmojiPicker from "emoji-picker-react";
import moment from "moment/moment";
import {GetMessages, SendMessage} from "../../api-calls/messages";
import {toast} from "react-hot-toast";
import {HideLoader, ShowLoader} from "../../redux/loaderSlice";

export function GameRoom() {
    const dispatch = useDispatch();
    const gameRoom = window["gameRoom"];
    const gameRoomSocket = io("http://localhost:3000/gameroom");
    const [connectedPlayers, setConnectedPlayers] = useState([]);
    const [newMessage, setNewMessage] = React.useState("");
    const {user} = useSelector((state) => state.userReducer);
    const [hideGameContainer, setGameContainer] = React.useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [messages = [], setMessages] = React.useState([]);

    const sendNewMessage = async () => {
        console.log(connectedPlayers);
        try {
            const message = {
                chat: gameRoom.chat._id,
                sender: user._id,
                text: newMessage
            };
            // send message to server using socket
            gameRoomSocket.emit("send-new-message", gameRoom._id, message);

            const response = await SendMessage(message);

            if (response.success) {
                setNewMessage("");

            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getMessages = async () => {
        try {
            dispatch(ShowLoader());
            const response = await GetMessages(gameRoom.chat._id);
            dispatch(HideLoader());
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };


    useEffect(() => {
        if(user) {
            getMessages();
            gameRoomSocket.emit("join-game-room", gameRoom._id, user.name);
            gameRoomSocket.emit("connected", user.name);
            gameRoomSocket.on("online-users", (users) => {
                setConnectedPlayers(users)
            });
            gameRoomSocket.on("player-disconnect", (username) => {
                console.log(`player ${username} disconnected`);
            })
            gameRoomSocket.off("receive-message").on("receive-message", (message) => {
                if(gameRoom.chat._id === message.chat) {
                    setMessages((messages) => [...messages, message]);
                }
            })

        }
    }, [user])

    useEffect(() => {
        if(user) {
            gameRoomSocket.off("receive-message").on("receive-message", (message) => {
                if(gameRoom.chat._id === message.chat) {
                    setMessages((messages) => [...messages, message]);
                }
            })

        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 400);

    }, [messages]);

    return (user && <div className='gap-2 flex rounded' id="body">
        <div className="SidePlayersContainer rounded border-b-green-800">
            <ul className="SidePlayersList">
                {connectedPlayers && connectedPlayers.map((player, index) => {
                    return <li key={index} className="row rounded border-2 border-gray-800">
                        <div id="icon">
                            <Icon.PersonCircle/>
                        </div>
                        <div id="name">
                            {player}
                        </div>
                    </li>;
                })}
            </ul>
        </div>
        <div className="PartyContainer flex flex-col w-full">
            <p>Room ID : {gameRoom._id}</p>
            <div className="GameChatContainer border-1 border-b-gray-300 rounded-2xl flex w-full">
                <div className={`ChatContainer border-1 border-b-gray-300 flex flex-col rounded-2xl ${hideGameContainer ? "w-1/3" : "w-full"}`}>
                    <div className="overflow-y-scroll flex border-1 m-1 rounded-2xl p-1 w-full h-full" id="messages">
                        <div className='flex flex-col gap-1 w-full'>
                            {messages.map((message) => {
                                const isCurrentUserTheSender = message.sender === user._id;
                                return (<div className={`flex ${isCurrentUserTheSender && 'justify-end'}`}>
                                        <div className='flex flex-col'>
                                            <h1 className={`${isCurrentUserTheSender ? "bg-green-800 text-white" : "bg-gray-300 text-green-800"
                                            } p-2 rounded-xl text-sm`
                                            }
                                            >{message.text}</h1>
                                            <h1 className='text-sm'>{moment(message.createdAt).format("dd hh:mm")}</h1>
                                        </div>
                                        {isCurrentUserTheSender && <Icon.CheckAll
                                            className={`${message.read ? "text-green-700" : "text-gray-200"}`}></Icon.CheckAll>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className='SendMessageContainer h-10 rounded-2xl border flex justify-between text-xs relative'>
                        {showEmojiPicker && <div className="absolute bottom-0 left-0">
                            <EmojiPicker height={350} onEmojiClick={(e) => {
                                setNewMessage(newMessage + e.emoji);
                                setShowEmojiPicker(false);
                            }}/>
                        </div>}
                        <Icon.EmojiSunglasses onClick={() => setShowEmojiPicker(!showEmojiPicker)}/>
                        <input type="text" placeholder='write something...'
                               className='w-[100%] border-0 h-full rounded-2xl focus:border-none'
                               value={newMessage}
                               onChange={(e) => setNewMessage(e.target.value)}/>
                        <button onClick={sendNewMessage}><Icon.Send className='mr-3'></Icon.Send></button>
                    </div>
                </div>
                <div className={`GameContainer border-1 border-b-gray-300 flex rounded-2xl ${hideGameContainer ? "w-2/3" : "w-[0vh]"}`}>

                </div>
            </div>
        </div>
    </div>);
}