import React, {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Icon from 'react-bootstrap-icons';
import { CreateNewChat } from '../../../api-calls/chats';
import { SetAllChats, SetSelectedChat } from '../../../redux/userSlice';
import { toast } from 'react-hot-toast';
import { HideLoader, ShowLoader } from '../../../redux/loaderSlice';
import moment from 'moment';
import store from "../../../redux/store";

function UserList({ searchKey, socket, onlineUsers }) {
    const { allUsers, allChats, user, selectedChat} = useSelector((state) => state.userReducer);
    const dispatch = useDispatch();
    const createNewChat = async (receipentUserId) => {
        try {
            dispatch(ShowLoader());
            const response = await CreateNewChat([user._id, receipentUserId]);
            dispatch(HideLoader());
            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                const updatedChats = [...allChats, newChat];
                dispatch(SetAllChats(updatedChats));
                dispatch(SetSelectedChat(newChat));
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    const openChat = (receipentUserId) => {
        const chat = allChats.find(
            (chat) =>
                chat.members.map((mem) => mem._id).includes(user._id) &&
                chat.members.map((mem) => mem._id).includes(receipentUserId)
        );
        if (chat) {
            dispatch(SetSelectedChat(chat));
        }
    };

    const getData = () => {
        // if search key is empty then return all chats else return filtered chats and users
        try {
            if (searchKey === "") {
                return allChats || [];
            }
            return allUsers.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchKey.toLowerCase()) || []
            );
        } catch (error) {
            return [];
        }
    };

    const getIsSelectedChatOrNot = (userObj) => {
        if (selectedChat) {
            return selectedChat.members.map((mem) => mem._id).includes(userObj._id);
        }
        return false;
    };

    const getLastMessage = (userObj) => {
        const chat = allChats.find((chat) =>
            chat.members.map((mem) => mem._id).includes(userObj._id)
        );
        if (!chat || !chat.lastMessage) {
            return "";
        } else {
            const lstMessagePerson = chat?.lastMessage?.sender === user._id ? "You:" : "";
            return (<div className='flex justify-between'>
                <h1 className='text-xs'>{lstMessagePerson} {chat?.lastMessage?.text}</h1>
                <h1 className='text-xs'>{moment(chat?.lastMessage?.createdAt).format("hh:mm dd")}</h1>
            </div>);
        }
    };

    const getUnreadMessages = (userObj) => {
        const chat = allChats.find((chat) =>
            chat.members.map((mem) => mem._id).includes(userObj._id)
        );
        if (
            chat &&
            chat?.unreadMessages &&
            chat?.lastMessage?.sender !== user._id
        ) {
            return (
                <div className='bg-green-700 text-white text-xs rounded-full m-1 h-5 w-5 flex items-center justify-center'>
                    {chat?.unreadMessages}
                </div>
            );
        }
    };

    useEffect(() => {
        socket.on("receive-message", (message) => {
            // if the chat area opened is not equal to chat in message , then increase unread messages by 1 and update last message
            const tempSelectedChat = store.getState().userReducer.selectedChat;
            let tempAllChats = store.getState().userReducer.allChats;
            if (tempSelectedChat?._id !== message.chat) {
                const updatedAllChats = tempAllChats.map((chat) => {
                    if (chat._id === message.chat) {
                        return {
                            ...chat,
                            unreadMessages: (chat?.unreadMessages || 0) + 1,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                        };
                    }
                    return chat;
                });
                tempAllChats = updatedAllChats;
            }

            // always latest message chat will be on top
            const latestChat = tempAllChats.find((chat) => chat._id === message.chat);
            const otherChats = tempAllChats.filter(
                (chat) => chat._id !== message.chat
            );
            tempAllChats = [latestChat, ...otherChats];
            dispatch(SetAllChats(tempAllChats));
        });
    }, []);

    return (
        <div className='flex flex-col mt-5 lg:w-80 xl:w-80 md:w-60 sm:w-60'>
            {getData().map((chatObjOrUserObj) => {
                let userObj = chatObjOrUserObj;
                if (chatObjOrUserObj.members) {
                    userObj = chatObjOrUserObj.members.find(
                        (mem) => mem._id !== user._id
                    );
                }
                return (
                    <div className={`shadow border p-1 rounded-xl m-1 bg-white flex justify-between w-full
                            ${getIsSelectedChatOrNot(userObj) && "border-primary border-2"}
                        `}
                        key={userObj._id}
                        onClick={() => openChat(userObj._id)}
                    >
                        <div className='flex gap-2 items-center w-full'>
                            {userObj.profilePic && (
                                <img
                                    src={userObj.profilePic}
                                    alt="profile photo"
                                    className='w-10 h-10 rounded-full flex items-center justify-center'
                                />
                            )}
                            {!userObj.profilePic && (
                                <Icon.PersonCircle className='h-12 w-12 flex items-center justify-center relative'></Icon.PersonCircle>
                            )}
                            <div className='flex flex-col gap-1 w-full'>
                                <div className='flex gap-1'>
                                    <h1 className='text-sm m-1'>{userObj.name}</h1>
                                    {onlineUsers.includes(userObj._id) &&
                                        <div className="bg-green-600 h-3 w-3 rounded-full m-2">
                                        </div>}
                                    {getUnreadMessages(userObj)}
                                </div>
                                <h1 className='text-xs'>{getLastMessage(userObj)}</h1>
                            </div>
                        </div>
                        <div onClick={() => createNewChat(userObj._id)}>
                            {!allChats.find((chat) => chat.members.map((member) => member._id).includes(userObj._id)) && (
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