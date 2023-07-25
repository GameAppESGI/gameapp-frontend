import * as Icon from 'react-bootstrap-icons';

const SidebarData = [
    {
        title: "Home",
        icon: <Icon.House/>,
        link: "/"
    },
    {
        title: "Leaderboard",
        icon: <Icon.Trophy/>,
        link: "/leaderboard"
    },
    {
        title: "Friends",
        icon: <Icon.People/>,
        link: "/friends"
    },
    {
        title: "Create Game",
        icon: <Icon.Controller/>,
        link: "/create-game"
    },
    {
        title: "Your Profile",
        icon: <Icon.Person/>,
        link: "/profile"
    },
    {
        title: "Create Room",
        icon: <Icon.Dice4/>,
        link: "/profile"
    },

]


export function Sidebar() {

    return (
        <div className="Sidebar rounded">
            <ul className="SidebarList">
                {SidebarData.map((val, key) => {
                    return (
                        <li key={key} className="row" onClick={() => {window.location.pathname = val.link}}>
                            <div id="icon">{val.icon}</div>
                            <div id="title">{val.title}</div>
                        </li>);
                })}
            </ul>
        </div>

    );
}

export default Sidebar;