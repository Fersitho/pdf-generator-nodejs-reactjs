import { configureStore } from "@reduxjs/toolkit";
import userReducer from './reducers/userSlice'

import  storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";

const persistConfig = {
    key: 'userGlobalState', //nombre con el que se almacena
    storage,
    whitelist: ['userState','otroState'], // pasamos los reducer que queremos guardar unicamente y queremos tener dry view all time change
}
// agregamos userState a whitelist para que se guarden este estado
const rootReducer = combineReducers({
    userState: userReducer
})
// podemos añadir varios reducers en slice se encarga de generarlo correctamente. 
const persistedRedcuer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    
    reducer: persistedRedcuer,
    middleware: [thunk]
})
