import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Icon from 'react-bootstrap-icons';
import { CreateNewChat } from '../../../api-calls/chats';
import { SetAllChats, SetSelectedChat } from '../../../redux/userSlice';
import { toast } from 'react-hot-toast';
import { HideLoader, ShowLoader } from '../../../redux/loaderSlice';

function UserList({ searchKey }) {
    const { allUsers, allChats, user, selectedChat } = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const createNewChat = async (withUserId) => {
        try {
            dispatch(ShowLoader());
            const response = await CreateNewChat([user._id, withUserId]);
            dispatch(HideLoader())
            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                const updatedChats = [...allChats, newChat];
                dispatch(SetAllChats(updatedChats));
                dispatch(SetSelectedChat(newChat));
            }
            else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openChat = (withUserId) => {
        const chat = allChats.find(
            (chat) =>
                chat.members.map((mem)=>mem._id).includes(user._id) &&
                chat.members.map((mem)=>mem._id).includes(withUserId)
        );
        if(chat) {
            dispatch(SetSelectedChat(chat));
        }
    };

    const getData = () => {
        return allUsers.filter((userObj) => (userObj.name.includes(searchKey) && 
            searchKey) || allChats.some((chat) => chat.members.map((member) => member._id).includes(userObj._id)));
    };

    const getIsSelectedChatOrNot = (userObj) => {
        if(selectedChat) {
            return selectedChat.members.map((mem) => mem._id).includes(userObj._id)
        }
        return false;
    };

    return (
        
        <div className='flex flex-col mt-5'>
            {getData().map((userObj) => {
                    return (
                        <div className={`shadow border p-1 rounded-xl m-1 bg-white flex justify-between
                            ${getIsSelectedChatOrNot(userObj) && "border-primary border-2"}
                        `}
                            key={userObj._id}
                            onClick={() => openChat(userObj._id)}
                        >
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
                                <h1 className='text-sm m-1'>{userObj.name}</h1>
                            </div>
                            <div onClick={() => createNewChat(userObj._id)}>
                                {!allChats.find((chat) => chat.members.map((member)=>member._id).includes(userObj._id)) && (
                                    <button className='border-green-900 text-green-900 bg-white px-1 py-1 rounded-md border m-1 text-xl'>
                                        Connect 
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}

export default UserList;