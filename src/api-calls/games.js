import {axiosInstance} from "."


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
    } catch (error) {
        return error.response.data;
    }
};

export const FindAllGamesForUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/games/get-all-games/${userId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const EndGame = async (chatId) => {
    try {
        const response = await axiosInstance.post(`/api/games/end/${chatId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export const SaveGameAction = async (chatId, gameAction) => {
    try {
        const response = await axiosInstance.post(`/api/games/add-action/${chatId}`, gameAction);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export const UploadGame = async (gameFile) => {
    try {
        const response = await axiosInstance.post("/api/games/upload-game", gameFile);
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
}

export const UploadGameToDB = async (game) => {
    try {
        const response = await axiosInstance.post("/api/games/upload-game-db", game);
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
}

export const GetAllGames = async () => {
    try {
        const response = await axiosInstance.post("/api/games/get-all-games");
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
}
