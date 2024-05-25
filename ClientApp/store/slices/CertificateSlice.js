import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	training:[],
	final:[],
}

const certificates = createSlice({
    name: 'certificates',
    initialState,
    reducers: {
        setTraining:(state,action)=>{
			state.training = action.payload;
		},
		setFinal:(state,action)=>{
			state.final = action.payload;
		}
    }
})

export const { setTraining, setFinal } = certificates.actions
export default certificates.reducer;