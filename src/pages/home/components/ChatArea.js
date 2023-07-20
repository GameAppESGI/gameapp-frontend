import React, {useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import * as Icon from 'react-bootstrap-icons'
import {SendMessage, GetMessages} from '../../../api-calls/messages';
import {SetAllInvitations} from '../../../redux/userSlice';
import {HideLoader, ShowLoader} from '../../../redux/loaderSlice';
import {toast} from 'react-hot-toast';
import moment from 'moment';
import {ReadAllMessages} from '../../../api-calls/chats';
import {SetAllChats} from '../../../redux/userSlice';
import store from "../../../redux/store";
import {
    AcceptGameInvitation,
    CancelGameInvitation,
    GetAllInvitations,
    SendGameInvitation
} from "../../../api-calls/gameInvitations";
import {FindActiveGame, StartGame} from "../../../api-calls/games";
import GameRender from "./GameRender";

function ChatArea({socket}) {
    const dispatch = useDispatch();
    const [newMessage, setNewMessage] = React.useState("");
    const {selectedChat, user, allChats, allInvitations} = useSelector((state) => state.userReducer);
    const [messages = [], setMessages] = React.useState([]);
    const [hideGameContainer, setGameContainer] = React.useState(false);
    const startGameBoolean = useRef(false);
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
    function generateInvitationId() {
        return Math.random().toString(36).substr(2, 9);
    }

    const sendGameInvitation = async () => {
        try {
            const invitation = {
                _id: generateInvitationId(),
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
            if (response.success) {
                const newInvitation = response.data;
                const updatedInvitations = [...allInvitations, newInvitation];
                dispatch(SetAllInvitations(updatedInvitations));
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const startGame = async (gameName, chatId) => {
        try {
            const game = {
                gameName: gameName,
                chat: chatId,
            };
            const response = await StartGame(game);
            if (response.success) {
                setGameContainer(!hideGameContainer);
                socket.emit("start-game", {
                    ...game,
                    members: selectedChat.members.map((mem) => mem._id),
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const acceptGameInvitation = async (currentUserToastId, otherUserToastId, invitation) => {
        console.log("USER TO ACCE{T INVIT TOASTID  = ", otherUserToastId);
        try {
            const response = await AcceptGameInvitation(invitation._id);
            if (response.success) {
                socket.emit("accept-invitation", {
                    toastId: currentUserToastId,
                    members: selectedChat.members.map((mem) => mem._id),
                    chat: invitation.chat
                });
                toast.dismiss(otherUserToastId);
            }

        }
        catch (error) {
            toast.error(error.message);
        }
    }

    const cancelGameInvitation = async (currentUserToastId, otherUserToastId, invitationId) => {
        console.log("USER THAT SEND INVITATION TOASTID = ", currentUserToastId);
        try {
            const response = await CancelGameInvitation(invitationId);
            if (response.success) {
                socket.emit("cancel-invitation", {
                    toastId: otherUserToastId,
                    members: selectedChat.members.map((mem) => mem._id)
                });
                toast.dismiss(currentUserToastId);
            }
        } catch (error) {
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

            const response = await SendMessage(message);

            if (response.success) {
                setNewMessage("");

            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const getActiveGame = async () => {
        try {
            const response = await FindActiveGame(selectedChat._id);
            if(response.success && response.data.length > 0) {
                return response.data;
            }
            return false;
        }
        catch (error) {
            toast.error(error.message);
        }
    }

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

        getActiveGame().then((activeGames) => {
            if(!activeGames) {
                console.log("no active games found");
                setGameContainer(false);
            }
            else {
                console.log("active games found");
                setGameContainer(true);
            }
        });

        socket.off("receive-message").on("receive-message", (message) => {
            console.log(message);
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

        socket.off("game-invitation-accepted").on("game-invitation-accepted", (invitation) => {
            toast.dismiss(invitation.toastId);
            console.log("should start game");
            startGame("morpion", invitation.chat);
        })

        socket.off("invitation-canceled").on("invitation-canceled", (invitationId) => {
            toast.dismiss(invitationId);
            console.log("should cancel toast");
        })

        socket.off("game-invitation-sent").on("game-invitation-sent", (invitation) => {
            let currentUserToastId = "";
            let otherUserToastId = "";
            if (invitation.receiver === user._id) {
                otherUserToastId = toast.loading(
                    <div>
                        <p>Wants to play with you. Click
                            <button onClick={() => {acceptGameInvitation(currentUserToastId,otherUserToastId,invitation)}}
                                    className="border-1 m-1 p-1 rounded" id="AcceptGameButton">
                                here
                            </button> to play!
                        </p>
                    </div>
                );
            } else {
                currentUserToastId = toast.loading(
                    <div>
                        <p>Waiting to join. Click
                            <button onClick={() => {cancelGameInvitation(currentUserToastId, otherUserToastId, invitation._id)}}
                                    className="border-1 rounded m-1 p-1" id="CancelGameButton">
                                here
                            </button> to cancel invitation!
                        </p>
                    </div>
                );
            }
            /*
            console.log("START GAME ? = ", startGameBoolean);
            if(startGameBoolean) {
                socket.on("game-started", (data) => {
                    startGame(otherUserToastId, "morpion", invitation.chat);
                    toast.dismiss(waitingToPlayToastId);
                    setGameContainer(!hideGameContainer);
                    console.log("GAME ID = ", data);
                });
            }

             */
        })

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
    }, [selectedChat, startGameBoolean]);

    useEffect(() => {
        const messagesContainer = document.getElementById('messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, [messages]);

    return (
        <div className='bg-white h-[95vh] border rounded w-full flex flex-col justify-between p-2'>
            <div className="w-full">
                <div className='flex gap-2 items-center mb-2 justify-between w-full'>
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

                            <button onClick={sendGameInvitation} className="border-1 rounded p-1 m-1" id="PlayButton">
                                Play
                            </button>

                    </div>
                </div>
                <hr/>
            </div>
            <div className="flex h-[80vh] w-full">
                <div className='overflow-y-scroll flex border-1 m-1 rounded-2xl p-1 w-full'
                     id="messages">
                    <div className='flex flex-col gap-1 w-full'>
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
                {hideGameContainer && (<div className='border-1 m-1 rounded-2xl flex w-full' id="game">
                    <GameRender socket = {socket}/>
                </div>)}
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