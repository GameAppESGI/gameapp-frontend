import React from 'react'
import { useSelector } from 'react-redux'
import * as Icon from 'react-bootstrap-icons';

function UserList({searchKey}) {
    const {allUsers} = useSelector((state) => state.userReducer);
    
    return (
        <div className='flex flex-col'>
            {allUsers
            .filter((user) => user.name.includes(searchKey) && searchKey ) 
            .map((userObj) => {
                return (
                    <div className='shadow border p-1 rounded-2xl col-6 m-1 bg-white'>
                        <div className='flex gap-2 items-center'>
                            {userObj.profilePic && (
                                <img 
                                    src={userObj.profilePic}
                                    alt="profile photo"
                                    className='w-10 h-10 rounded-full flex items-center justify-center'
                                />
                            )}
                            {!userObj.profilePic && (
                                <Icon.PersonCircle className='w-8 h-8 flex items-center justify-center'></Icon.PersonCircle>
                            )}
                            <h1 className='text-xl m-1'>{userObj.name}</h1>
                        </div>
                    </div>
                );
            })}
        </div>
    );
    }

export default UserList;