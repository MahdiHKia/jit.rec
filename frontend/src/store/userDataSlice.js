import { useSelector } from 'react-redux';
import { createSlice } from '@reduxjs/toolkit';
export const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    loading: true,
    value: null,
  },
  reducers: {
    login: (state, { payload }) => {
      state.value = { ...state.value, ...payload };
    },
    logout: (state) => {
      state.value = null;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
  },
});

export const useUserData = () => useSelector((state) => state.userData.value);
export const useUserDataLoading = () => useSelector((state) => state.userData.loading);
export const userDataActions = userDataSlice.actions;
export default userDataSlice.reducer;
