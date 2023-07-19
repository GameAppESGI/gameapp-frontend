import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";

function GameRender({socket}) {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = React.useState("");
    const {selectedChat, user, allChats, allInvitations} = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = React.useState([]);
    const [hideGameContainer, setGameContainer] = React.useState(false);
    const [display, setDisplay] = React.useState({});
    const socketRef = useRef();
    const otherUser = selectedChat.members.find(
        (mem) => mem._id !== user._id
    );

    const sendGameActionToServer = () => {
        socket.emit("send-game-action-to-server", {
            action: {
                actions: [
                    {
                        x: 200,
                        y: 100,
                        player: 2
                    }
                ]
            },
            members: selectedChat.members.map((mem) => mem._id)
        });
    }

    const test = () => {
        console.log("FROM TEST = " , display);
    }

    useEffect(() => {
        socket.off("send-game-data-to-clients").on("send-game-data-to-clients", (data) => {
            console.log(data);
            setDisplay(data);
            console.log("DIsplay = ", display );
        });
    }, [selectedChat]);

    return (
        <div>
            <p>Playing with {otherUser.name}</p>
            {test()}
            <svg viewBox="0 0 100 100" id="mySVG">

                <circle x="0" y="0" player="1" fill="blue" id="circle1" onClick={(e) => {sendGameActionToServer(e)}}/>

                <circle x="200" y="200" r="20" fill="red" onClick={(e) => {sendGameActionToServer(e)}} />

                <circle cx="50" cy="50" r="10" fill="yellow" />

            </svg>
        </div>);

}

export default GameRender