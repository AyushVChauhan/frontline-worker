import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	training: [],
	final: [],
	practice: [],
	general: [],
	currentQuiz: null,
	sessionId: null,
}

const history = createSlice({
	name: 'history',
	initialState,
	reducers: {
		setHistoryTraining: (state, action) => {
			state.training = action.payload;
		},
		setHistoryFinal: (state, action) => {
			state.final = action.payload;
		},
		setHistoryPractice: (state, action) => {
			state.practice = action.payload;
		},
		setHistoryGeneral: (state, action) => {
			state.general = action.payload;
		},
		setCurrentQuiz: (state, action) => {
			state.currentQuiz = action.payload.currentQuiz;
			state.sessionId = action.payload.sessionId;
		},
	}
})

export const { setHistoryTraining, setHistoryFinal, setHistoryPractice,setHistoryGeneral, setCurrentQuiz } = history.actions
export default history.reducer;