import "./Modal.css";
import {useSelector} from "react-redux";
import * as Icon from 'react-bootstrap-icons';

export function GameModal({game, closeModal}) {
    const {user, allUsers} = useSelector((state) => state.userReducer);

    const getOtherUsername = () => {
            const otherUserId = game.players.find(player => player._id !== user._id);
            const username = allUsers.find(otherUser => otherUser._id === otherUserId).name;
            console.log(username);
            return username.toUpperCase();
    }

    return (
        <div className="modalBackground">
            <div className="modalContainer">
                <div className="titleCloseBtn">
                    <button onClick={() => {closeModal(false)}}> X </button>
                </div>
                <div className="modalTitle">
                    <h2> Your {game.gameName.toUpperCase()} game with id {game._id} vs {getOtherUsername()}</h2>
                    <hr/>
                </div>
                <div className="bodyModal">
                    <p>
                        Render Game
                    </p>
                </div>
                <div className="footerModal">
                    <button><Icon.SkipBackwardBtn className="w-20 h-20"/></button>
                    <button><Icon.SkipForwardBtn className="w-20 h-20"/></button>
                </div>
            </div>
        </div>
    );
}