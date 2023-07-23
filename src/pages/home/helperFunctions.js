import {SendGameInvitation} from "../../api-calls/gameInvitations";
import {toast} from "react-hot-toast";
export function generateInvitationId() {
    return Math.random().toString(36).substr(2, 9);
}
export const sendGameInvitation = async (user, selectedChat, otherUser, socket) => {
    try {
        const invitation = {
            _id: generateInvitationId(),
            chat: selectedChat._id,
            sender: user._id,
            receiver: otherUser._id,
            game: "morpion"
        };


        socket.emit("send-game-invitation", (invitation));

        const response = await SendGameInvitation(invitation);
        if (response.success) {
            return response;
        }
    } catch (error) {
        toast.error(error.message);
    }
}