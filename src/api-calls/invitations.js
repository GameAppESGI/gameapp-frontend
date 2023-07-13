import { axiosInstance } from ".";

export const SendGameInvitation = async (members) => {
    try {
        const response = await axiosInstance.post('/api/invitations/create-new-game-invitation', {members});
        return response.data;
    } catch (error) {
        return error.response.data;
    }

};