import {useSelector} from "react-redux";
import Sidebar from "../home/components/Sidebar";
import React from "react";
import UserList from "../home/components/UserList";

export function CreateRoom() {
    const [searchKey, setSearchKey] = React.useState("");
    const {user} = useSelector((state) => state.userReducer);
    const [onlineUsers, setOnlineUsers] = React.useState([]);

    return (
        user && (<div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="CreateRoom" className="rounded justify-center">
                <h1 id="CreateRoomTitle">Create New Game Room</h1>

            </div>
        </div>)
    );
}