import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import authApi from '../api/authApi';
import { AuthPage } from '../pages/auth';
import { DashBoardMainPage } from '../pages/dashboard';
import { userDataActions } from '../store/userDataSlice';
import { useUserData } from '../store/userDataSlice';

function MainRoutes() {
  const userData = useUserData();
  const dispatch = useDispatch();

  useEffect(() => {
    authApi
      .getUserInfo()
      .then((res) => dispatch(userDataActions.login(res.data)))
      .catch((err) => null)
      .finally(() => dispatch(userDataActions.setLoading(false)));
  }, [dispatch]);

  return (
    <Routes>
      {userData ? (
        <>
          <Route path="dash/*" element={<DashBoardMainPage />} />
          <Route path="*" element={<Navigate to={{ pathname: 'dash/' }} />} />
        </>
      ) : (
        <>
          <Route path="auth/*" element={<AuthPage />} />
          <Route path="*" element={<Navigate to={{ pathname: 'auth/' }} />} />
        </>
      )}
    </Routes>
  );
}

export default function Router() {
  return (
    <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
  );
}
