import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { GetAllUsers, GetCurrentUser } from '../api-calls/users';
import { GetAllChats, CreateNewChat } from '../api-calls/chats';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { ShowLoader, HideLoader } from '../redux/loaderSlice';
import { SetAllUsers, SetUser, SetAllChats } from '../redux/userSlice';
import * as Icon from 'react-bootstrap-icons';
import { io } from "socket.io-client";
import {HeaderComponent} from "../pages/home/HeaderComponent";
import {FooterComponent} from "../pages/home/components/FooterComponent";
import Sidebar from "../pages/home/components/Sidebar";


const socket = io("http://34.155.239.150");
    function ProtectedRoute({children}) {
        const {user} = useSelector(state => state.userReducer);
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const getCurrentUser = async () => {
            try {
                dispatch(ShowLoader());
                const response = await GetCurrentUser();
                const allUsersResponse = await GetAllUsers();
                const allChatsResponse = await GetAllChats();
                dispatch(HideLoader());
                if(response.success) {
                    allUsersResponse.data.sort(function(a,b) {return b.points - a.points});
                    dispatch(SetUser(response.data));
                    dispatch(SetAllUsers(allUsersResponse.data));
                    dispatch(SetAllChats(allChatsResponse.data));
                }
                else {
                    toast.error(response.message);
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } catch (error) {
                dispatch(HideLoader());
                toast.error(error.message);
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
        
        useEffect(() => {
            if(localStorage.getItem("token")) {
                getCurrentUser();
            }
            else {
                navigate("/login");
            }
        }, []);

    return (
        <div className='w-full h-full bg-gray-800'>
            <HeaderComponent socket={socket}
            user={user}/>
            {children}
            <FooterComponent />
        </div>

    );
}

export default ProtectedRoute

