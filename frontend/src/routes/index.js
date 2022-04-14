import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

function MainRoutes() {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />
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
