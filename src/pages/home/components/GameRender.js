import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {toast} from "react-hot-toast";

function GameRender({gameSocket}) {
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const [gridDisplay, setGridDisplay] = React.useState({});
    const mousePos = useRef({x: 0, y: 0});
    const otherUser = selectedChat.members.find((mem) => mem._id !== user._id);

    const sendGameActionToServer = (event) => {
        const {currentTarget: svg, pageX, pageY} = event
        const coords = svg.getBoundingClientRect()
        mousePos.current = {
            x: (Math.floor((pageX - coords.x) / 100)) * 100,
            y: (Math.floor((pageY - coords.y) / 100)) * 100,
        };
        gameSocket.emit("update-game", {
            actions: [
                {
                    x: mousePos.current.x,
                    y: mousePos.current.y,
                    player: 1
                }
            ]
        }, otherUser._id);
        gameSocket.emit("send-game-action-to-server", {
            actions: [
                {
                    x: mousePos.current.x,
                    y: mousePos.current.y,
                    player: 1
                }
            ]
        });

    console.log(`GAME ACTION SENT : X = ${mousePos.current.x} Y = ${mousePos.current.y}`);
}

const displayGameContent = () => {
    let svgElements = [];
    if (gridDisplay.displays) {
        for (let i = 1; i < gridDisplay.displays[0].content.length; i++) {
            if (gridDisplay.displays[0].content[i].tag === "line") {
                svgElements.push(<line x1={gridDisplay.displays[0].content[i].x1}
                                       x2={gridDisplay.displays[0].content[i].x2}
                                       y1={gridDisplay.displays[0].content[i].y1}
                                       y2={gridDisplay.displays[0].content[i].y2}
                                       stroke={"black"}
                                       strokeWidth="4"/>);
            }
            if (gridDisplay.displays[0].content[i].tag === "circle") {
                svgElements.push(<circle cx={gridDisplay.displays[0].content[i].cx}
                                         cy={gridDisplay.displays[0].content[i].cy}
                                         r={gridDisplay.displays[0].content[i].r}
                                         fill={gridDisplay.displays[0].content[i].fill}/>);
            }
        }
    }
    console.log(svgElements.length);
    return svgElements;
}

useEffect(() => {
    gameSocket.on("send-game-update-to-other", (actionReceived) => {
        console.log("FINAL ACTION TO SEND TO SERVER BY SECOND PLAYER = ", actionReceived);
        gameSocket.emit("send-game-action-to-server", {
            actions: [
                {
                    x: actionReceived.actions[0].x,
                    y: actionReceived.actions[0].y,
                    player: 2
                }
            ]
        });
    });
    gameSocket.off("send-game-data-to-clients").on("send-game-data-to-clients", (data) => {
        if (!data.errors) {
            console.log(data);
            setGridDisplay(data);
        } else {
            console.log(data);
            //toast.error(data.errors[0].type);
        }
    });
}, [selectedChat]);

return (
    <div id="GameRender" className="flex">
        <div className="flex">
            <p>Playing with {otherUser.name}</p>
        </div>
        <div className="flex justify-center align-items-center" id="gameSVG">
            <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" version="1.1"
                 onClick={(e) => {
                     sendGameActionToServer(e)
                 }}>
                {displayGameContent()}
            </svg>
        </div>
    </div>);

}

export default GameRender