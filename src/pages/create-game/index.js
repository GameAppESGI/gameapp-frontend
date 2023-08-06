import {useSelector} from "react-redux";
import Sidebar from "../home/components/Sidebar";
import React, {createRef} from "react";
import {UploadGame} from "../../api-calls/games";
import {toast} from "react-hot-toast";

export function CreateGame() {
    const [searchKey, setSearchKey] = React.useState("");
    const {user} = useSelector((state) => state.userReducer);
    const [onlineUsers, setOnlineUsers] = React.useState([]);

    const fileInput = createRef();

    const downloadGuide = () => {
        fetch('Protocole.pdf').then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = 'Protocole.pdf';
                alink.click();
            })
        })
    }
    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("game", fileInput.current.files[0]);

        try {
            const response = await UploadGame(formData);
            if(response.success) {
                toast.success("FILE UPLOADED");
            }
            else {
                toast.error("FILE NOT UPLOADED");
            }
        }
        catch (error) {
            toast.error(error.message);
        }
    }

    return (
        user && (<div className='gap-2 h-full w-full flex' id="body">
            <Sidebar/>
            <div id="CreateGame" className="rounded justify-center">
                <h1 id="CreateGameTitle">Create New Game</h1>
                <div className="CreateGameInfos">
                    <p>
                        You want to create a game ? <br/>
                        Download our guide, write the game and send us your source code.
                    </p>
                    <button className="DownloadGuideButton" onClick={downloadGuide}>
                        Download Guide
                    </button>
                </div>
                <div className="CreateGameContainer">
                    <form onSubmit={onSubmit}>
                        <input className="file-input" type="file" name="game" ref={fileInput}/>
                        <input className="file-send" type="submit" value="Send"/>
                    </form>
                </div>
            </div>
        </div>)
    );
}