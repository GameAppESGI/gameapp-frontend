import React, {useEffect} from 'react'
import SearchUser from './components/SearchUser'
import ChatArea from './components/ChatArea'
import UserList from './components/UserList';
import { useSelector } from 'react-redux';
import {io} from "socket.io-client";
const socket = io("localhost:5000");

function Home() {
  const [searchKey, setSearchKey] = React.useState("");
  const {selectedChat, user} = useSelector((state)=>state.userReducer);

  useEffect(() => {
      if(user) {
          socket.emit("join-room", user._id);
      }
  }, [user]);



  return (
    <div className='flex gap-2 w-full'>

      <div className='w-[37vh]'>
        <SearchUser 
          searchKey={searchKey}
          setSearchKey={setSearchKey}
        />
        <UserList
          searchKey={searchKey}
          socket={socket}
        />

      </div>

      <div className='w-full'>
        {selectedChat && <ChatArea
            socket={socket}/>}
      </div>
    </div>
  )
}

export default Home