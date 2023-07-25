import * as Icon from "react-bootstrap-icons";
import React from "react";
import { useNavigate } from 'react-router-dom';
import logo from "./logo.jpg"
export function HeaderComponent({socket, user}) {
    const navigate = useNavigate();
    return (
        <div className='w-full flex justify-between rounded' id="header">
            <div className='flex items-center gap-1' id="test">
                <button className="rounded" id="sidebarButton"><Icon.List size={20}></Icon.List></button>
                <div id="logo" className="rounded">
                    <img src={logo}></img>
                </div>

            </div>
            <div className='flex items-center gap-2'>
                <h1 className='text-white text-2xl'>{user?.name.toUpperCase()}</h1>
                <Icon.PersonCircle size={50}></Icon.PersonCircle>
                <button>
                    <Icon.BoxArrowRight size={20}
                                        onClick={() => {
                                            socket.emit("go-offline", user._id);
                                            localStorage.removeItem("token");
                                            navigate("/login");
                                        }}
                    ></Icon.BoxArrowRight>
                </button>
            </div>
        </div>
    );
}