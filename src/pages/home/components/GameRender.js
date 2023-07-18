import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

function GameRender({socket}) {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = React.useState("");
    const {selectedChat, user, allChats, allInvitations} = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = React.useState([]);
    const [hideGameContainer, setGameContainer] = React.useState(false);
    const otherUser = selectedChat.members.find(
        (mem) => mem._id !== user._id
    );

    const showArea = (event) => {
        var width = parseFloat(event.target.getAttributeNS(null,"cx"));

        socket.emit("test-socket", {
            message: "user" + user.name + "clicked on " + width,
        });
    }

    const sendGameActionToServer = (event) => {
        const actions = [{
            x: event.target.getAttributeNS(null, "x"),
            y: event.target.getAttributeNS(null, "y"),

        }]
        socket.emit("send-game-action-to-server", {
            action: {
                actions: [
                    {
                        x: 100,
                        y: 100,
                        player: 1
                    }
                ]
            },
            members: selectedChat.members.map((mem) => mem._id)
        });
    }

    useEffect(() => {

    })
    return (
        <div>
            <p>Playing with {otherUser.name}</p>
            <svg viewBox="0 0 100 100" id="mySVG">

                <circle x="0" y="0" player="1" fill="blue" id="circle1" onClick={(e) => {sendGameActionToServer(e)}}/>

                <circle x="200" y="200" r="20" fill="red" onClick={(e) => {sendGameActionToServer(e)}} />

                <circle cx="50" cy="50" r="10" fill="yellow" />

            </svg>
        </div>);

}

export default GameRender