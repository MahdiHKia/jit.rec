import { configureStore } from '@reduxjs/toolkit';

import userDataReducer from './userDataSlice';

export default configureStore({
  reducer: {
    userData: userDataReducer,
  },
});
