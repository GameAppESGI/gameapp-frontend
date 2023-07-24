import React, {useEffect} from 'react'
import SearchUser from './components/SearchUser'
import ChatArea from './components/ChatArea'
import UserList from './components/UserList';
import {useSelector} from 'react-redux';
import {io} from "socket.io-client";
import 'react-pro-sidebar/dist/css/styles.css';

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
        <div className='flex gap-2 w-full'>

            <div className='w-[37vh]'>
                <SearchUser
                    searchKey={searchKey}
                    setSearchKey={setSearchKey}
                />
                <UserList
                    searchKey={searchKey}
                    socket={socket}
                    onlineUsers={onlineUsers}
                />
            </div>

            {selectedChat && (
                <div className="w-full">
                    <ChatArea socket={socket}/>
                </div>
            )}
            {!selectedChat && (
                <div className="w-full h-[80vh] items-center flex justify-center bg-white rounded-xl" id="homePageBackground">

                </div>
            )}
        </div>
    );
}

export default Home