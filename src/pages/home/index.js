import React from 'react'
import SearchUser from './components/SearchUser'
import ChatArea from './components/ChatArea'
import UserList from './components/UserList';
import { useSelector } from 'react-redux';
import {io} from "socket.io-client";

function Home() {
  const socket = io("localhost:5000");
  const [searchKey, setSearchKey] = React.useState("");
  const {selectedChat} = useSelector((state)=>state.userReducer);
  return (
    <div className='flex gap-2 w-full'>

      <div className='w-[37vh]'>
        <SearchUser 
          searchKey={searchKey}
          setSearchKey={setSearchKey}
        />
        <UserList
          searchKey={searchKey}
        />

      </div>

      <div className='w-full'>
        {selectedChat && <ChatArea/>}
      </div>
    </div>
  )
}

export default Home