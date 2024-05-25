import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    quizAuth: 0,
    quizId:null,
    quiz:null,
    type:null
};

const quizAuth = createSlice({
    name: "quizAuth",
    initialState,
    reducers: {
        setQuizAuth: (state, action) => {
            state.quizAuth = action.payload;
        },
        setQuizId:(state,action)=>{
            state.quizAuth = 1;
            state.quizId = action.payload;
        },
        setQuiz:(state,action)=>{
            state.quiz = action.payload;
            state.type = 2;
        }
    },
});
export const { setQuizAuth, setQuizId, setQuiz } = quizAuth.actions;
export default quizAuth.reducer;