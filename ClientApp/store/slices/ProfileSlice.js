import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    profile: null,
};
const profile = createSlice({
	initialState,
	name:"profile",
	reducers:{
		setProfile:(state,action)=>{
			state.profile = action.payload;
		}
	}
})
export const {setProfile} = profile.actions;
export default profile.reducer;
