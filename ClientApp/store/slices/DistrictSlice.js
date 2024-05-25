import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    districts: [],
}

const districts = createSlice({
    name: 'districts',
    initialState,
    reducers: {
        setDistricts: (state, action) => {
            state.districts = action.payload;
        },
    }
})

export const { setDistricts } = districts.actions
export default districts.reducer