import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
    },
    reducers: {
        SetUser:  (state, action) => {
            state.user = action.payload;
        },
        SetAllUsers: (state, action) => {
            state.allUsers = action.payload;
        }
    },
});

export const {SetUser, SetAllUsers} = userSlice.actions;
export default userSlice.reducer;