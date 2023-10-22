import Sidebar from "../home/components/Sidebar";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {FindAllGamesForUser, GetAllGames} from "../../api-calls/games";
import {HideLoader, ShowLoader} from "../../redux/loaderSlice";
import {toast} from "react-hot-toast";
import {SetAllGames, SetSelectedGame} from "../../redux/userSlice";
import moment from "moment/moment";
import * as Icon from 'react-bootstrap-icons';
import {GameModal} from "./components/GameModal";
export function History() {
    const {user, allGames, selectedGame} = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const [openGameModal, setGameModal] = React.useState(false);
    const [gamesAvailable, setGamesAvailable] = React.useState([]);
    const [gamesWithLanguage, setGamesWithLanguage] = React.useState([]);


    const getAllGamesAvailable = async () => {
        const getAllGamesResponse = await GetAllGames();
        const gameList = [];
        if(getAllGamesResponse.success) {
            setGamesWithLanguage(getAllGamesResponse.data);
            getAllGamesResponse.data.forEach((game) => gameList.push(game.name));
            setGamesAvailable(gameList);
        }
    }

    const getGamesHistory = async () => {
        try {
            dispatch(ShowLoader());
            const response = await FindAllGamesForUser(user?._id);
            dispatch(HideLoader());
            if (response.success) {
                dispatch(SetAllGames(response.data));
                console.log(allGames);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    }

    const gameEnded = (game) => {
        if(game.end) return ("Game Ended");
        else return ("Still in play...");
    }
    const openGameReplay = (game) => {
        setGameModal(true);
        console.log(`game name  = ${game.language}`);
        dispatch(SetSelectedGame(game));
    }

    useEffect(() => {
        getGamesHistory();
        getAllGamesAvailable();
    }, [user])

    return (
        user && <div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="History" className="rounded justify-center">
                <h1 id="HistoryTitle">Your Game History</h1>
                <div className="HistoryContaier">
                    <ul className="HistoryList">
                        {allGames && allGames.map((game, key) => {
                            return (
                                <li key={key} className="HistoryRow">
                                    <div id="replay"><button className="rounded-full" onClick={() => openGameReplay(game)}><Icon.PlayBtn/></button></div>
                                    <div id="gameName">{game.gameName}</div>
                                    <div id="createdAt">{moment(game?.createdAt).format("DD MM YYYY")}</div>
                                    <div id="end">{gameEnded(game)}</div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            {openGameModal && <GameModal
                game={selectedGame}
                closeModal={setGameModal}/>}
        </div>
    )
}