import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";

function GameRender({gameSocket, players}) {
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const [gridDisplay, setGridDisplay] = React.useState({});
    const [gridLimits, setGridLimits] = React.useState({width:0, height:0});
    const mousePos = useRef({x: 0, y: 0});
    const otherUser = selectedChat.members.find((mem) => mem._id !== user._id);
    console.log(`PLAYERS from gamerender = ${players.player1} AND ${players.player2}`)
    const sendGameActionToServer = (event) => {
        const {currentTarget: svg, pageX, pageY} = event
        const coords = svg.getBoundingClientRect()
        mousePos.current = {
            x: (Math.floor((pageX - coords.x) / 100)) * 100,
            y: (Math.floor((pageY - coords.y) / 100)) * 100,
        };
        console.log(`Y = ${mousePos.current.y} && realY = ${pageY - coords.y}`)
        if(players.player2 === user._id) {
            console.log(`This is ${user.name} as player2`)
            gameSocket.emit("update-game", {
                actions: [
                    {
                        x: mousePos.current.x,
                        y: mousePos.current.y,
                        player: 2
                    }
                ]
            }, players.player1);
        }
        if(players.player1 === user._id) {
            console.log(`This is ${user.name} as player1`)
            gameSocket.emit("send-game-action-to-server", {
                actions: [
                    {
                        x: mousePos.current.x,
                        y: mousePos.current.y,
                        player: 1
                    }
                ]
            });
        }

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
    return svgElements;
}

useEffect(() => {
    if(players.player1 === user._id) {
        gameSocket.on("send-game-update-to-other", (actionReceived) => {
            gameSocket.emit("send-game-action-to-server", {
                actions: [
                    {
                        x: actionReceived.actions[0].x,
                        y: actionReceived.actions[0].y,
                        player: actionReceived.actions[0].player
                    }
                ]
            });
        });
    }
    gameSocket.off("send-game-data-to-clients").on("send-game-data-to-clients", (data) => {
        console.log("data received");
        if (!data.errors && data.game_state.game_over === false) {
            setGridDisplay(data);
            setGridLimits({width: data.displays[0].width, height: data.displays[0].height});
        } else if(data.errors){
            console.log(data);
            //toast.error(data.errors[0].type);
        }
        else if (!data.errors && data.game_state.game_over === true) {
            console.log("GAME OVER");
            setGridDisplay(data);
        }
    });
}, [selectedChat]);

return (
    <div id="GameRender" className="flex">
        <div className="flex">
            <p>Playing with {otherUser.name}</p>
        </div>
        <div className="flex justify-center align-items-center" id="gameSVG">
            <svg width={gridLimits.width} height={gridLimits.height} xmlns="http://www.w3.org/2000/svg" version="1.1"
                 onClick={(e) => {
                     sendGameActionToServer(e)
                 }}>
                {displayGameContent()}
            </svg>
        </div>
    </div>);

}

export default GameRender