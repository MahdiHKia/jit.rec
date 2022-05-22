import { Navigate, Route, Routes } from 'react-router-dom';

import { MyRecordingsPage } from '../pages/dashboard/myRecordingsPage';
import { SettingsPage } from '../pages/dashboard/settingsPage';

export default function DashBoardRotes() {
  return (
    <Routes>
      <Route path="myRecordings" element={<MyRecordingsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to={{ pathname: 'myRecordings' }} />} />
    </Routes>
  );
}
