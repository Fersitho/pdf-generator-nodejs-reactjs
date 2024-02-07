import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: '',
    username: '',
    email: '',
}

export const userSlice = createSlice({
    name: 'user', 
    // nommbre para acceder al objeto sin persist se genera esto! combine storege lo decidimos en store.
    initialState,
    reducers: {
        addUser: (state, action) => {
            const { name, username, email } = action.payload;
            state.name = name;
            state.username = username;
            state.email = email;

        },
        changeEmail: (state,action) => {
            state.email = action.payload
        }
    }
})


export const {addUser, changeEmail} = userSlice.actions;
export default userSlice.reducer;