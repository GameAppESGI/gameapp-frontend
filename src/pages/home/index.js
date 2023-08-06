import React, {useEffect} from 'react'
import ChatArea from './components/ChatArea'
import {useSelector} from 'react-redux';
import {io} from "socket.io-client";
import Sidebar from "./components/Sidebar";
import {FriendsArea} from "./FriendsArea";
import {HomePageArea} from "./components/HomePageArea";

const socket = io("localhost:5000");
console.log("SOCKET = ", socket);
localStorage.setItem("socket", socket)

function Home() {
    const [searchKey, setSearchKey] = React.useState("");
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const [onlineUsers, setOnlineUsers] = React.useState([]);

    useEffect(() => {
        if (user) {
            socket.emit("join-room", user._id);
            socket.emit("connected", user._id);
            socket.on("online-users", (users) => {
                setOnlineUsers(users)
            });

        }
    }, [user]);


    return (
        <div className='gap-2 h-[100vh] w-full flex' id="body">
            <Sidebar/>
            {selectedChat && (
                <ChatArea socket={socket}/>
            )}
            {!selectedChat && (
                <HomePageArea />
            )}
            <FriendsArea
                searchKey={searchKey}
                setSearchKey={setSearchKey}
                socket={socket}
                onlineUsers={onlineUsers}
            />
        </div>
    );
}

export default Home