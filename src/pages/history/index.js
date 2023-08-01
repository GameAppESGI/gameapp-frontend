import Sidebar from "../home/components/Sidebar";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {FindAllGamesForUser} from "../../api-calls/games";
import {HideLoader, ShowLoader} from "../../redux/loaderSlice";
import {toast} from "react-hot-toast";
import {SetAllGames} from "../../redux/userSlice";
import moment from "moment/moment";
import * as Icon from 'react-bootstrap-icons';
export function History() {
    const {user, allGames} = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();

    const getGamesHistory = async () => {
        try {
            dispatch(ShowLoader());
            const response = await FindAllGamesForUser(user?._id);
            dispatch(HideLoader());
            if (response.success) {
                dispatch(SetAllGames(response.data));
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getGamesHistory();
    }, [user])

    return (
        user && <div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="History" className="rounded flex justify-center">
                <ul className="HistoryList">
                    {allGames.map((game, key) => {
                        return (
                            <li key={key} className="HistoryRow">
                                <div id="replay"><button className="rounded-full"><Icon.PlayBtn/></button></div>
                                <div id="gameName">{game.gameName}</div>
                                <div id="createdAt">{moment(game?.createdAt).format("DD MM YYYY")}</div>
                            </li>
                        )
                    })}
                </ul>

            </div>
        </div>
    )
}