import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { GetAllUsers, GetCurrentUser } from '../api-calls/users';
import { GetAllChats, CreateNewChat } from '../api-calls/chats';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { ShowLoader, HideLoader } from '../redux/loaderSlice';
import { SetAllUsers, SetUser, SetAllChats } from '../redux/userSlice';
import * as Icon from 'react-bootstrap-icons';

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
        <div className='w-screen h-screen'>
            <div>
                <div className='flex justify-between p-7 m-3 rounded-xl bg-gray-100'>
                    <div className='flex items-center gap-1'>
                        <Icon.Controller size={100}></Icon.Controller>
                        <h1 className='text-3xl uppercase font-semibold text-green-700'>GAMEAPP</h1>
                    </div>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-green-700 text-2xl'>{user?.name}</h1>
                        <Icon.PersonCircle size={50}></Icon.PersonCircle>
                        <button>
                            <Icon.BoxArrowRight size={50}
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate("/login");
                                }}
                            ></Icon.BoxArrowRight>
                        </button>
                    </div>
                </div>
            </div>
            <div className='flex justify-between p-7 m-3 bg-gray-100 rounded-xl' >
                {children}
            </div>
        </div>

    );
}

export default ProtectedRoute

