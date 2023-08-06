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
            button: <Icon.Pencil/>
        },
        {
            title: user?.email,
            field: "Email:",
            button: <Icon.Pencil/>
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
            <div id="Profile" className="rounded justify-center">
                <h1 id="ProfileTitle">Your Profile</h1>
                <div className="ProfileContainer">
                    <ul className="ProfileList">
                        <li className="ProfileRow">{image && (
                            <img src={image} className="w-32 h-32 rounded-full"/>
                        )}
                            <div>
                                <label htmlFor="file-input" className="file-input">
                                    <input type="file" onChange={onFileSelect} className="file-input"/>
                                </label>
                            </div>
                        </li>
                        {data.map((val, key) => {
                            return (
                                <li key={key} className="ProfileRow">
                                    <div id="field">{val.field}</div>
                                    <div id="title">
                                        <div className="flex">
                                            {val.title}
                                            <button className="pl-3">{val.button}</button>
                                        </div>
                                    </div>
                                </li>);
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}