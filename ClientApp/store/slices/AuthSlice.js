import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    auth: false,
    token: "",
    username: "",
    password: "",
    FCM:"",
};

const auth = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action) => {
            state.auth = true;
            state.token = action.payload.token;
            state.username = action.payload.username;
            state.password = action.payload.password;
        },
        setToken: (state, action) => {
            state.token = action.payload.token;
            state.username = action.payload.username;
            state.password = action.payload.password;
        },
        destroyToken:(state,action)=>{
            state.auth = false;
            state.token = null;
            state.username = "";
            state.password = "";
        },
        setFCM:(state,action)=>{
            state.FCM = action.payload;
        }
    },
});
export const { setAuth, setToken, destroyToken, setFCM } = auth.actions;
export default auth.reducer;