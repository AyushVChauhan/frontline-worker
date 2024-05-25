import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    subjects : [],
	mySubjectId : "",
	mySubjectName : "",
}

const subjects = createSlice({
    name: 'subjects',
    initialState,
    reducers: {
        setSubjects: (state, action) => {
            state.subjects = action.payload;
        },
		setMySubject : (state, action)=>{
			state.mySubjectId = action.payload.id;
			state.mySubjectName = action.payload.name;
		},
        removeMySubject : (state)=>{
            state.mySubjectId = "";
            state.mySubjectName = "";
        }
    }
})

export const { setMySubject, setSubjects, removeMySubject } = subjects.actions
export default subjects.reducer