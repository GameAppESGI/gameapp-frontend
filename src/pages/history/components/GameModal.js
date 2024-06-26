import "./Modal.css";
import {useSelector} from "react-redux";
import * as Icon from 'react-bootstrap-icons';
import {io} from "socket.io-client";
import React, {useEffect, useRef} from "react";
import {SaveGameAction} from "../../../api-calls/games";
import {toast} from "react-hot-toast";

export function GameModal({game, closeModal}) {
    const gameReplaySocket = io("http://localhost:3000/replay");
    const {user, allUsers} = useSelector((state) => state.userReducer);
    const [gridDisplay, setGridDisplay] = React.useState({});
    const [gridLimits, setGridLimits] = React.useState({width: 0, height: 0});
    const [isLoading, setLoading] = React.useState(true);
    const [counter, setCounter] = React.useState(0);
    const mousePos = useRef({x: 0, y: 0});

    const activateGameReplay = () => {
        if(game.end) {
            const gameActionsWithoutId = [];
            game.actions.map((action) => gameActionsWithoutId.push({
                player: action.player,
                x: action.x,
                y: action.y
            }))
            console.log("game actions = ", gameActionsWithoutId);
            gameReplaySocket.emit("activate-game-replay", gameActionsWithoutId, game.end);
        }
        else {
            const gameActionsWithoutId = [];
            game.actions.map((action) => gameActionsWithoutId.push({
                player: action.player,
                x: action.x,
                y: action.y
            }))
            for(let i=0; i<gameActionsWithoutId.length; i++) {
                gameReplaySocket.emit("continue-game", gameActionsWithoutId[i]);
            }
        }


    }

    const closeModalAndDisconnectSocket = () => {
        gameReplaySocket.disconnect();
        closeModal(false);
    };

    const displayGameContent = () => {
        let svgElements = [];
        for (let i = 1; i < counter; i++) {
            if (gridDisplay.content[i].tag === "line") {
                svgElements.push(<line x1={gridDisplay.content[i].x1}
                                       x2={gridDisplay.content[i].x2}
                                       y1={gridDisplay.content[i].y1}
                                       y2={gridDisplay.content[i].y2}
                                       stroke={"black"}
                                       strokeWidth="4"/>);
            }
            if (gridDisplay.content[i].tag === "circle") {
                svgElements.push(<circle cx={gridDisplay.content[i].cx}
                                         cy={gridDisplay.content[i].cy}
                                         r={gridDisplay.content[i].r}
                                         fill={gridDisplay.content[i].fill}/>);
            }
        }
        return svgElements;
    }

    const canAvance = () => {
        if(!isLoading && (counter < gridDisplay.content.length)) return true;
        else return false;
    }

    const canGoBackward = () => {
        if(!isLoading && (counter > 1)) return true;
        else return false;
    }

    const getOtherUsername = () => {
            const otherUserId = game.players.find(player => player._id !== user._id);
            const username = allUsers.find(otherUser => otherUser._id === otherUserId).name;
            return username.toUpperCase();
    }

    const saveGameAction = async (action) => {
        try {
            await SaveGameAction(game.chat, action)
        } catch (error) {
            toast.error(error);
        }
    }

    const sendGameActionToServer = async (event) => {
        const {currentTarget: svg, pageX, pageY} = event
        const coords = svg.getBoundingClientRect()
        mousePos.current = {
            x: (Math.floor((pageX - coords.x) / 100)) * 100,
            y: (Math.floor((pageY - coords.y) / 100)) * 100,
        };

        const action = {
            player: 1,
            x: mousePos.current.x,
            y: mousePos.current.y
        };

        await saveGameAction(action);
        console.log(`clicked on ${action}`);
        gameReplaySocket.emit("continue-game", action);
    }

    const goBackward = () => {
        setCounter(count => count -1);
    }

    const goForward = () => {
        setCounter(count => count +1);
    }

    useEffect(() => {
        gameReplaySocket.off("send-game-display").on("send-game-display", (display) => {
            console.log("DISPLAY received from server = ", display);
            setGridDisplay(display);
            setCounter(display.content.length);
            setGridLimits({width: display.width, height: display.height});
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if(user) {
            activateGameReplay();
        }
    }, [user]);

    return (
        <div className="modalBackground">
            <div className="modalContainer">
                <div className="titleCloseBtn">
                    <button onClick={() => closeModalAndDisconnectSocket()}> X </button>
                </div>
                <div className="modalTitle">
                    <h2> Your {game.gameName.toUpperCase()} game with id {game._id} vs {getOtherUsername()}</h2>
                    <hr/>
                </div>
                <div className="bodyModal">
                    <svg width={gridLimits.width} height={gridLimits.height} xmlns="http://www.w3.org/2000/svg"
                         version="1.1"
                    onClick={(e) => {
                        sendGameActionToServer(e)
                    }}>
                        {!isLoading && displayGameContent()}
                    </svg>
                </div>
                <div className="footerModal">
                    {canGoBackward() && <button><Icon.SkipBackwardBtn className="w-20 h-20" onClick={() => goBackward()}/></button>}
                    {canAvance() && <button><Icon.SkipForwardBtn className="w-20 h-20" onClick={() => goForward()}/></button>}
                </div>
            </div>
        </div>
    );
}