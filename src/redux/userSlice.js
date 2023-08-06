import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        allUsers: [],
        allChats: [],
        selectedChat: null,
        allInvitations: [],
        allGames: []
    },
    reducers: {
        SetUser:  (state, action) => {
            state.user = action.payload;
        },
        SetAllUsers: (state, action) => {
            state.allUsers = action.payload;
        },
        SetAllChats: (state, action) => {
            state.allChats = action.payload;
        },
        SetSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
        SetAllInvitations: (state, action) => {
            state.allInvitations = action.payload;
        },
        SetAllGames: (state, action) => {
            state.allGames = action.payload;
        },
        SetSelectedGame: (state, action) => {
            state.selectedGame = action.payload;
        }
    },
});

export const {SetUser, SetAllUsers,
    SetAllChats, SetSelectedChat,
    SetAllInvitations, SetAllGames,
    SetSelectedGame} = userSlice.actions;
export default userSlice.reducer;