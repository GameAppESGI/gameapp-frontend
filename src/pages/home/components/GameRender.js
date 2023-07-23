import React, {useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {EndGame} from "../../../api-calls/games";
import {toast} from "react-hot-toast";
import {sendGameInvitation} from "../helperFunctions";
import {SetAllInvitations} from "../../../redux/userSlice";

function GameRender({socket, gameSocket, players}) {
    const {selectedChat, user, allInvitations} = useSelector((state) => state.userReducer);
    const [gridDisplay, setGridDisplay] = React.useState({});
    const [gridLimits, setGridLimits] = React.useState({width: 0, height: 0});
    const mousePos = useRef({x: 0, y: 0});
    const [gameOver, setGameOver] = React.useState(false);
    const [rematchGame, setRematch] = React.useState(false);
    const [rematchDisabled, setRematchDisabled] = React.useState(false);
    const dispatch = useDispatch();
    const otherUser = selectedChat.members.find(
        (mem) => mem._id !== user._id
    );
    const actions = [];
    const sendGameActionToServer = (event) => {
        const {currentTarget: svg, pageX, pageY} = event
        const coords = svg.getBoundingClientRect()
        mousePos.current = {
            x: (Math.floor((pageX - coords.x) / 100)) * 100,
            y: (Math.floor((pageY - coords.y) / 100)) * 100,
        };
        console.log(`Y = ${mousePos.current.y} && realY = ${pageY - coords.y}`)
        if (players.player2 === user._id) {
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
        if (players.player1 === user._id) {
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

    const sendRematchInvitation = async () => {
        const newInvitationResponse = await sendGameInvitation(user, selectedChat, otherUser, socket);
        if (newInvitationResponse.success) {
            const newInvitation = newInvitationResponse.data;
            const updatedInvitations = [...allInvitations, newInvitation];
            dispatch(SetAllInvitations(updatedInvitations));
        }
    }

    const rematch = () => {
        gameSocket.emit("send-rematch", user._id);
        setRematchDisabled(true);
        setGameOver(false);
        sendRematchInvitation();
    }


    useEffect(() => {
        if (players.player1 === user._id) {
            gameSocket.on("send-game-update-to-other", (actionReceived) => {
                console.log("action received from other");
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
        gameSocket.off("send-game-data-to-clients").on("send-game-data-to-clients", async (data) => {
            console.log("data received");
            if (!data.errors && data.game_state.game_over === false) {
                setGridDisplay(data);
                setGridLimits({width: data.displays[0].width, height: data.displays[0].height});
            } else if (data.errors) {
                console.log(data);
                //toast.error(data.errors[0].type);
            } else if (!data.errors && data.game_state.game_over === true) {
                setGridDisplay(data);
                setGameOver(true);
                setRematchDisabled(false);
                console.log("GAME OVER");
                console.log(data);
                gameSocket.emit("end-game");
                try {
                    await EndGame(selectedChat._id);
                } catch (error) {
                    toast.error(error.message);
                }
            }
        });

        gameSocket.on("rematch-sent", (userId) => {
            if (userId !== user._id) {
                console.log(`user ${user._id} received rematch request`)
                setRematch(true);
            }
        })
    }, [selectedChat, user, players, rematchGame]);

    return (
        <div id="GameRender" className="flex">
            <div className="flex flex-col justify-center align-items-center" id="gameSVG">
                {(gameOver && !rematchGame) && <div className="flex flex-col justify-center align-items-center p-5 ">
                    <p>GAME OVER</p>
                    <div className="flex">
                        <button disabled={rematchDisabled} onClick={rematch} className="border-1 rounded p-1 m-1"
                                id="RematchButton">Rematch
                        </button>
                    </div>
                </div>}
                <svg width={gridLimits.width} height={gridLimits.height} xmlns="http://www.w3.org/2000/svg"
                     version="1.1"
                     onClick={(e) => {
                         sendGameActionToServer(e)
                     }}>
                    {displayGameContent()}
                </svg>
            </div>

        </div>);

}

export default GameRender