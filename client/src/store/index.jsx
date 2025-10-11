import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import themeConfigSlice from './themeConfigSlice';
import {authApi} from './auth/authApi'
import {daynamicApi} from './dynamicApi'


export default configureStore({
  reducer: {
    // themeConfig: themeConfigSlice,
      [authApi.reducerPath] : authApi.reducer,
      [daynamicApi.reducerPath] : daynamicApi.reducer,
  },
  devTools:false,

  middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(
          authApi.middleware, 
          daynamicApi.middleware, 
          ),
  
});