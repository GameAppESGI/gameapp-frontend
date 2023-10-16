import {useSelector} from "react-redux";
import Sidebar from "../home/components/Sidebar";
import React, {createRef} from "react";
import {UploadGame, UploadGameToDB} from "../../api-calls/games";
import {toast} from "react-hot-toast";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";

export function CreateGame() {

    const [inputValue, setInputValue] = React.useState("");
    const {user} = useSelector((state) => state.userReducer);
    const [selectedLanguage, setSelectedLanguage] = React.useState("");
    const languages = ["python","java","c","rust"];
    const fileInput = createRef();

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("game", fileInput.current.files[0]);
        const game = {
            name: inputValue,
            language: selectedLanguage
        };
        try {
            const response = await UploadGame(formData);
            await UploadGameToDB(game);
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

    const data = [
        {
            title: (
                <InputText value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
            ),
            field: "Game Name:"
        },
        {
            title: (
                <Dropdown value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.value)}
                          options={languages} placeholder="Select a Language"></Dropdown>
            ),
            field: "Language:"
        },
        {
            title: (
                <form onSubmit={onSubmit}>
                    <input className="file-input" type="file" name="game" ref={fileInput}/>
                    <input className="file-send" type="submit" value="Send"/>
                </form>
            ),
            field: "Select file:"
        }
    ];

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
                <div className="ProfileContainer">
                    <ul className="ProfileList">
                        {data.map((val, key) => {
                            return (
                                <li key={key} className="ProfileRow">
                                    <div id="field">{val.field}</div>
                                    <div id="title">
                                        <div className="flex">
                                            {val.title}
                                        </div>
                                    </div>
                                </li>);
                        })}
                    </ul>
                </div>
            </div>
        </div>)
    );
}