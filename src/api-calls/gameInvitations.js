import { axiosInstance } from "."

export const SendGameInvitation = async (invitation) => {
    try {
        const response = await axiosInstance.post("/api/game-invitations/new-invitation", invitation);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const GetAllInvitations = async (chatId) => {
    try {
        const response = await axiosInstance.get(`/api/game-invitations/get-all-invitations/${chatId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export const CancelGameInvitation = async (invitationId) => {
    try {
        const response = await axiosInstance.post(`/api/game-invitations/cancel/${invitationId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export const AcceptGameInvitation = async (invitationId) => {
    try {
        const response = await axiosInstance.post(`/api/game-invitations/accept/${invitationId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}