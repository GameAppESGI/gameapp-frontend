import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Icon from 'react-bootstrap-icons'
import { SendMessage, GetMessages } from '../../../api-calls/messages';
import { HideLoader, ShowLoader } from '../../../redux/loaderSlice';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { ReadAllMessages } from '../../../api-calls/chats';
import { SetAllChats } from '../../../redux/userSlice';
import store from "../../../redux/store";

function ChatArea({socket}) {
  const dispatch = useDispatch();

  const [newMessage, setNewMessage] = React.useState("");
  const { selectedChat, user, allChats } = useSelector((state) => state.userReducer);
  const [messages = [], setMessages] = React.useState([]);

  const otherUser = selectedChat.members.find(
    (mem) => mem._id !== user._id
  );

  const sendNewMessage = async () => {
    try {
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
      };
      socket.emit("send-new-message", {
        ...message,
        members: selectedChat.members.map((member) => member._id),
        createdAt: moment(),
        read: false,
      });

      const response = await SendMessage(message);
      if (response.success) {
        setNewMessage("")
      }
    } catch (error) {
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
    }
    catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const readAllMessages = async () => {
    try {

      socket.emit("read-all-messages", {
        chat: selectedChat._id,
        members: selectedChat.members.map((member) => member._id),
      });

      const response = await ReadAllMessages(selectedChat._id);
      if(response.success) {
        const updatedChats = allChats.map((chat) => {
          if(chat._id === selectedChat._id) {
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
    getMessages();
    if(selectedChat?.lastMessage?.sender !== user._id) {
      readAllMessages();
    }

    socket.off("receive-message").on("receive-message", (message) => {
      const selectedChatTemp = store.getState().userReducer.selectedChat;
      if(selectedChatTemp._id === message.chat) {
        setMessages((messages) => [...messages, message]);
      }
      if(selectedChatTemp._id === message.chat && message.sender !== user._id) {
        readAllMessages();
      }
    });

    socket.on("unread-messages-cleared", (data) => {
      const tempAllChats = store.getState().userReducer.allChats;
      const tempSelectedChat = store.getState().userReducer.selectedChat;

      if(data.chat === tempSelectedChat._id) {
        const updatedChats = tempAllChats.map((chat) => {
          if(chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            };
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));

        setMessages(prevState => {
          return prevState.map(message => {
            return {
              ...message,
              read: true
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
        <div className='flex gap-2 items-center mb-2'>
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
        <hr />
      </div>
      <div className='h-[65vh] overflow-y-scroll '
        id={"messages"}>
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
              {isCurrentUserTheSender && <Icon.CheckAll className={`${message.read? "text-green-700" : "text-gray-200"}`}></Icon.CheckAll>}
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
            onChange={(e) => setNewMessage(e.target.value)} />
          <button onClick={sendNewMessage}><Icon.Send className='mr-3'></Icon.Send></button>
        </div>
      </div>
    </div>
  )
}

export default ChatArea