import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../pages/auth/loginPage';
import { SignUpPage } from '../pages/auth/signupPage';

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to={{ pathname: 'login' }} />} />
    </Routes>
  );
}
