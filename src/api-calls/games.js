import { axiosInstance } from "."


export const StartGame = async (game) => {
    try {
        const response = await axiosInstance.post("/api/games/start-new-game", game);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const FindActiveGame = async (chatId) => {
    try {
        const response = await axiosInstance.get(`/api/games/get-active-games/${chatId}`);
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
};