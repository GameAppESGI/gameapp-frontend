import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import * as Icon from 'react-bootstrap-icons'
import {SendMessage, GetMessages} from '../../../api-calls/messages';
import { SetAllInvitations } from '../../../redux/userSlice';
import {HideLoader, ShowLoader} from '../../../redux/loaderSlice';
import {toast} from 'react-hot-toast';
import moment from 'moment';
import {ReadAllMessages} from '../../../api-calls/chats';
import {SetAllChats} from '../../../redux/userSlice';
import store from "../../../redux/store";
import {CancelGameInvitation, GetAllInvitations, SendGameInvitation} from "../../../api-calls/gameInvitations";
import {StartGame} from "../../../api-calls/games";

function ChatArea({socket}) {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = React.useState("");
    const {selectedChat, user, allChats, allInvitations} = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = React.useState([]);
    //const [setInvitations] = React.useState([]);
    const otherUser = selectedChat.members.find(
        (mem) => mem._id !== user._id
    );

    const getAllGameInvitations = async () => {
        try {
            dispatch(ShowLoader());
            const response = await GetAllInvitations(selectedChat._id);
            dispatch(HideLoader());
            if (response.success) {
                dispatch(SetAllInvitations(response.data));
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    }

    const sendGameInvitation = async () => {
        try {
            const invitation = {
                chat: selectedChat._id,
                sender: user._id,
                receiver: otherUser._id,
                game: "morpion"
            };


            socket.emit("send-game-invitation", {
                ...invitation,
                members: selectedChat.members.map((mem) => mem._id),
            });

            const response = await SendGameInvitation(invitation);
            if(response.success) {
                const newInvitation = response.data;
                const updatedInvitations = [...allInvitations, newInvitation];
                dispatch(SetAllInvitations(updatedInvitations));
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    }

    const startGame = async (toastId, gameName, chatId) => {
        try {
            toast.dismiss(toastId);
            const game = {
                gameName: gameName,
            };
            const response = await StartGame(game);
            if(response.success) {
                if(allInvitations.length === 1) {
                    dispatch(SetAllInvitations([]));
                }
                else {
                    const index = allInvitations.findIndex((invitation) => invitation.chat === chatId);
                    if (index > -1) {
                        const updatedInvitations = allInvitations.splice(index, 1);
                        dispatch(SetAllInvitations(updatedInvitations));
                    }
                }
                await CancelGameInvitation(chatId);

                socket.emit("start-game", {
                    members: selectedChat.members.map((mem) => mem._id),
                    message: "game started"
                });
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    }

    const cancelGameInvitation = async (toastId, chatId) => {
        try {
            toast.dismiss(toastId);
            const response = await CancelGameInvitation(chatId);
            if(response.success) {
                if(allInvitations.length === 1) {
                    dispatch(SetAllInvitations([]));
                }
                else {
                    const index = allInvitations.findIndex((invitation) => invitation.chat === chatId);
                    if (index > -1) {
                        const updatedInvitations = allInvitations.splice(index, 1);
                        dispatch(SetAllInvitations(updatedInvitations));
                    }
                }

                socket.emit("cancel-invitation", {
                    members: selectedChat.members.map((mem) => mem._id),
                    message: "canceled"});
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    }

    const sendNewMessage = async () => {
        try {
            const message = {
                chat: selectedChat._id,
                sender: user._id,
                text: newMessage
            };
            // send message to server using socket
            socket.emit("send-new-message", {
                ...message,
                members: selectedChat.members.map((mem) => mem._id),
                createdAt: moment(),
                read: false,
            });

            // send message to server to save in db
            const response = await SendMessage(message);

            if (response.success) {
                setNewMessage("");

            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getMessages = async () => {
        try {
            dispatch(ShowLoader());
            const response = await GetMessages(selectedChat._id);
            dispatch(HideLoader());
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            dispatch(HideLoader());
            toast.error(error.message);
        }
    };

    const clearUnreadMessages = async () => {
        try {
            socket.emit("read-all-messages", {
                chat: selectedChat._id,
                members: selectedChat.members.map((mem) => mem._id),
            });

            const response = await ReadAllMessages(selectedChat._id);

            if (response.success) {
                const updatedChats = allChats.map((chat) => {
                    if (chat._id === selectedChat._id) {
                        return response.data;
                    }
                    return chat;
                });
                dispatch(SetAllChats(updatedChats));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getAllGameInvitations();
        getMessages();
        if (selectedChat?.lastMessage?.sender !== user._id) {
            clearUnreadMessages();
        }

        // receive message from server using socket
        socket.off("receive-message").on("receive-message", (message) => {
            const tempSelectedChat = store.getState().userReducer.selectedChat;
            if (tempSelectedChat._id === message.chat) {
                setMessages((messages) => [...messages, message]);
            }

            if (
                tempSelectedChat._id === message.chat &&
                message.sender !== user._id
            ) {
                clearUnreadMessages();
            }
        });



        socket.off("game-invitation-sent").on("game-invitation-sent", (invitation) => {
            if(invitation.receiver === user._id) {

                const invitationToastId = toast.loading(
                    <div>
                        <p>Wants to play with you. Click
                            <button onClick={(e) => {startGame(invitationToastId, "morpion", invitation.chat)}}
                                className="border-1 m-1 p-1 rounded" id="AcceptGameButton">
                                here
                            </button> to play!
                        </p>
                    </div>
                );

                socket.on("invitation-canceled", () => {
                    toast.dismiss(invitationToastId);
                });
            }
            else {
                const waitingToPlayToastId = toast.loading(
                    <div>
                        <p>Waiting to join. Click
                            <button onClick={(e) => {cancelGameInvitation(waitingToPlayToastId, invitation.chat)}}
                                className="border-1 rounded m-1 p-1" id="CancelGameButton">
                                here
                            </button> to cancel invitation!
                        </p>
                    </div>
                );

                socket.on("game-started", () => {
                    toast.dismiss(waitingToPlayToastId);
                });
            }

        })

        // clear unread messages from server using socket
        socket.on("unread-messages-cleared", (data) => {
            const tempAllChats = store.getState().userReducer.allChats;
            const tempSelectedChat = store.getState().userReducer.selectedChat;

            if (data.chat === tempSelectedChat._id) {
                const updatedChats = tempAllChats.map((chat) => {
                    if (chat._id === data.chat) {
                        return {
                            ...chat,
                            unreadMessages: 0,
                        };
                    }
                    return chat;
                });
                dispatch(SetAllChats(updatedChats));

                // set all messages as read
                setMessages((prevMessages) => {
                    return prevMessages.map((message) => {
                        return {
                            ...message,
                            read: true,
                        };
                    });
                });
            }
        });
    }, [selectedChat]);

    useEffect(() => {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, [messages]);

    return (
        <div className='bg-white h-[85vh] border rounded w-full flex flex-col justify-between p-2'>
            <div>
                <div className='flex gap-2 items-center mb-2 justify-between'>
                    <div className="flex">
                        {otherUser.profilePic && (
                            <img
                                src={otherUser.profilePic}
                                alt="profile photo"
                                className='w-10 h-10 rounded-full flex items-center justify-center'
                            />
                        )}
                        {!otherUser.profilePic && (
                            <Icon.PersonCircle className='w-8 h-8 flex items-center justify-center'></Icon.PersonCircle>
                        )}
                        <h1 className='text-sm m-1'>{otherUser.name}</h1>
                    </div>
                    <div>
                        {!allInvitations.find((invitation) => (invitation.chat === selectedChat._id )) && (
                            <button onClick={sendGameInvitation} className="border-1 rounded p-1 m-1" id="PlayButton">
                                Play
                            </button>
                        )}
                    </div>
                </div>
                <hr/>
            </div>
            <div className='h-[65vh] overflow-y-scroll '
                 id="messages">
                <div className='flex flex-col gap-2'>
                    {messages.map((message) => {
                        const isCurrentUserTheSender = message.sender === user._id;
                        return (<div className={`flex ${isCurrentUserTheSender && 'justify-end'}`}>
                                <div className='flex flex-col'>
                                    <h1 className={`${isCurrentUserTheSender ? "bg-green-800 text-white" : "bg-gray-300 text-green-800"
                                    } p-2 rounded-xl text-sm`
                                    }
                                    >{message.text}</h1>
                                    <h1 className='text-sm'>{moment(message.createdAt).format("dd hh:mm")}</h1>
                                </div>
                                {isCurrentUserTheSender && <Icon.CheckAll
                                    className={`${message.read ? "text-green-700" : "text-gray-200"}`}></Icon.CheckAll>}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div>
                <div className='h-10 rounded-2xl border flex justify-between text-xs'>
                    <input type="text" placeholder='write something...'
                           className='w-[100%] border-0 h-full rounded-2xl focus:border-none'
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}/>
                    <button onClick={sendNewMessage}><Icon.Send className='mr-3'></Icon.Send></button>
                </div>
            </div>
        </div>
    )
}

export default ChatArea