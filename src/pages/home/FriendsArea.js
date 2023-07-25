import SearchUser from "./components/SearchUser";
import UserList from "./components/UserList";
import React from "react";

export function FriendsArea({searchKey, setSearchKey, socket, onlineUsers}) {
    return (
        <div id="friendsArea">
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
    )
}