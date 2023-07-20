import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";

function GameRender({socket}) {
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const [display, setDisplay] = React.useState({});
    const mousePos = useRef({x:0,y:0});
    const otherUser = selectedChat.members.find((mem) => mem._id !== user._id);

    const sendGameActionToServer = (event) => {
        const { currentTarget: svg, pageX, pageY } = event
        const coords = svg.getBoundingClientRect()
        mousePos.current = {
            x: (Math.floor((pageX - coords.x)/100)) * 100,
            y: (Math.floor((pageY - coords.y)/100)) * 100,
        };
        console.log(`x = ${mousePos.current.x} y= ${mousePos.current.y}, socket = ${socket.id}`);
        socket.emit("send-game-action-to-server", {
            action: {
                actions: [
                    {
                        x: mousePos.current.x,
                        y: mousePos.current.y,
                        player: 1
                    }
                ]
            },
            members: selectedChat.members.map((mem) => mem._id)
        });
    }

    const displayGameContent = () => {
        if(display.displays) {
            return (
                <svg width={display.displays[0].width} height={display.displays[0].height} xmlns="http://www.w3.org/2000/svg" version="1.1"
                onClick={(e) => {sendGameActionToServer(e)}}>
                    <line x1={display.displays[0].content[1].x1} x2={display.displays[0].content[1].x2}
                          y1={display.displays[0].content[1].y1} y2={display.displays[0].content[1].y2}
                          stroke={"black"}
                          strokeWidth="4">
                    </line>
                    <line x1={display.displays[0].content[2].x1} x2={display.displays[0].content[2].x2}
                          y1={display.displays[0].content[2].y1} y2={display.displays[0].content[2].y2}
                          stroke={"black"}
                          strokeWidth="4">
                    </line>
                    <line x1={display.displays[0].content[3].x1} x2={display.displays[0].content[3].x2}
                          y1={display.displays[0].content[3].y1} y2={display.displays[0].content[3].y2}
                          stroke={"black"}
                          strokeWidth="4">
                    </line>
                    <line x1={display.displays[0].content[4].x1} x2={display.displays[0].content[4].x2}
                          y1={display.displays[0].content[4].y1} y2={display.displays[0].content[4].y2}
                          stroke={"black"}
                          strokeWidth="4">
                    </line>
                </svg>
            );
        }
       else {
           console.log(display);
        }
    }

    useEffect(() => {
        socket.off("send-game-data-to-clients").on("send-game-data-to-clients", (data) => {
            setDisplay(data);
        });
    }, [selectedChat]);

    return (
        <div id="GameRender" className="flex">
            <div className="flex">
                <p>Playing with {otherUser.name}</p>
            </div>
            <div className="flex justify-center align-items-center" id="gameSVG">
                {displayGameContent()}
            </div>
        </div>);

}

export default GameRender