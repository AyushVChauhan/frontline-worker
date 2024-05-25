import { StackRouter } from "@react-navigation/native";
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    topics: [],
};
const topics = createSlice({
    name: "topics",
    initialState,
    reducers: {
        setTopics: (state, action) => {
            state.topics = action.payload;
        },
        setBookmark: (state, action) => {
            state.topics.forEach((element) => {
                if (element._id == action.payload) {
                    if (element.bookmarked == 1) {
                        element.bookmarked = 0;
                    } else {
                        element.bookmarked = 1;
                    }
                }
            });
        },
        setCompleted:(state,action)=>{
            state.topics.forEach((element) => {
                if (element._id == action.payload) {
                    element.completed = 1;
                }
            });
        }
    },
});
export const { setTopics , setBookmark, setCompleted} = topics.actions;
export default topics.reducer;
