import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Icon from 'react-bootstrap-icons';
import { CreateNewChat } from '../../../api-calls/chats';
import { SetAllChats } from '../../../redux/userSlice';
import { toast } from 'react-hot-toast';
import { HideLoader, ShowLoader } from '../../../redux/loaderSlice';

function UserList({ searchKey }) {
    const { allUsers, allChats, user } = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const createNewChat = async (withUserId) => {
        try {
            dispatch(ShowLoader());
            const response = await CreateNewChat([user._id, withUserId]);
            dispatch(HideLoader());
            if(response.success) {
                toast.message(response.message);
                const newChat = response.data;
                const updatedChats = [...allChats, newChat];
                dispatch(SetAllChats(updatedChats));
            }
            else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoader());
            
        }
    }
    return (
        <div className='flex flex-col'>
            {allUsers
                .filter((userObj) => userObj.name.includes(searchKey) && searchKey)
                .map((userObj) => {
                    return (
                        <div className='shadow border p-1 rounded-2xl col-8 m-1 bg-white flex justify-between'>
                            <div className='flex gap-2 items-center'>
                                {userObj.profilePic && (
                                    <img
                                        src={userObj.profilePic}
                                        alt="profile photo"
                                        className='w-10 h-10 rounded-full flex items-center justify-center'
                                    />
                                )}
                                {!userObj.profilePic && (
                                    <Icon.PersonCircle className='w-8 h-8 flex items-center justify-center'></Icon.PersonCircle>
                                )}
                                <h1 className='text-xl m-1'>{userObj.name}</h1>
                            </div>
                            <div
                                onClick={() => CreateNewChat(userObj._id)}
                            >
                                {!allChats.find((chat) =>
                                    chat.users.includes(userObj._id)) && 
                                    (
                                        <button className='border-green-900 text-green-900 bg-white px-1 py-1 rounded-md border m-1 text-xl'>
                                            Connect
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default UserList;