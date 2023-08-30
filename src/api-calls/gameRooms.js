import { axiosInstance } from "."


export const CreateGameRoom = async (gameRoom) => {
    try {
        const response = await axiosInstance.post("/api/game-rooms/new-game-room", gameRoom);
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
}

export const JoinGameRoom = async (gameRoomId, userId) => {
    try {
        const response = await axiosInstance.post(`/api/game-rooms/join`,{gameRoomId: gameRoomId,userId: userId} );
        return response.data;
    }
    catch (error) {
        return error.response.data;
    }
}