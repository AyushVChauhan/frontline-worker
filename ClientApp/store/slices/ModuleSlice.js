import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    modules: [],
};
const modules = createSlice({
    name: "modules",
    initialState,
    reducers: {
        setModules: (state, action) => {
            state.modules = action.payload;
        },
        setRatingTrue: (state, action) => {
            state.modules.forEach((element) => {
                if (element._id == action.payload) {
                    element.ratingGiven = true;
                }
            });
        },
    },
});
export const { setModules, setRatingTrue } = modules.actions;
export default modules.reducer;
