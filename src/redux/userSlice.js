import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
        allChats: [],
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
        }
    },
});

export const {SetUser, SetAllUsers, SetAllChats} = userSlice.actions;
export default userSlice.reducer;