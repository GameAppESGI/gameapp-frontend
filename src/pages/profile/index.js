import Sidebar from "../home/components/Sidebar";
import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import * as Icon from "react-bootstrap-icons";
import moment from "moment";

export function Profile() {
    const {user} = useSelector((state) => state.userReducer);
    const [image = "", setImage] = React.useState(user?.profilePic);
    const data = [
        {
            title: user?.name,
            field: "Username:",
        },
        {
            title: user?.email,
            field: "Email:",
        },
        {
            title: user?.points,
            field: "Points:",
        },
        {
            title: moment(user?.createdAt).format("DD MM YYYY"),
            field: "Created:",
        },
    ];

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            setImage(reader.result);
        }
    };

    useEffect(() => {
        if(user?.profilePic) {
            setImage(user.profilePic);
        }
    }, [user]);

    return (
        user && <div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="Profile" className="rounded flex justify-center">
                <ul className="ProfileList">
                    <li>{image && (
                        <img src={image} className="w-32 h-32 rounded-full"/>
                    )}
                        <div>
                            <label htmlFor="file-input" className="cursor-pointer">
                                <input type="file" onChange={onFileSelect} className="file-input"/>
                            </label>
                        </div>
                    </li>
                    {data.map((val, key) => {
                        return (
                            <li key={key} className="row" onClick={() => {
                                window.location.pathname = val.link
                            }}>
                                <div id="icon">{val.field}</div>
                                <div id="title">{val.title}</div>
                            </li>);
                    })}
                </ul>
            </div>
        </div>
    );
}