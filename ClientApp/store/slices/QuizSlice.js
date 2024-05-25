import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    upcomingQuiz:[],
	availableQuiz:[],
	generalQuiz: [],
	history:[]
}

const quizzes = createSlice({
    name: 'quizzes',
    initialState,
    reducers: {
        setAvailableQuiz:(state,action)=>{
			state.availableQuiz = action.payload;
		},
		setUpcomingQuiz:(state,action)=>{
			state.upcomingQuiz = action.payload;
		},
		setGeneralQuiz:(state,action)=>{
			state.generalQuiz = action.payload;
		}
    }
})

export const { setAvailableQuiz, setUpcomingQuiz, setGeneralQuiz } = quizzes.actions
export default quizzes.reducer