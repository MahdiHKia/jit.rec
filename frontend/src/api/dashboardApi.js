import axios from 'axios';

import { API_BASE_URL } from './base';

const URLS = {
  updateUserInfo: `${API_BASE_URL}/auth/user_info`,
  changePassword: `${API_BASE_URL}/auth/change_password`,
  directory: (directoryId) => `${API_BASE_URL}/dashboard/dir/${directoryId}/`,
  createRecording: (directoryId) => `${API_BASE_URL}/dashboard/dir/${directoryId}/recordings`,
  recording: (directoryId, recordingId) =>
    `${API_BASE_URL}/dashboard/dir/${directoryId}/recordings/${recordingId}/`,
};

const dashBoardApi = {
  updateUserInfo: (first_name, last_name) => axios.put(URLS.updateUserInfo, { first_name, last_name }),
  changePassword: (old_password, new_password) =>
    axios.post(URLS.changePassword, { old_password, new_password }),

  getDirectory: (directoryId = 0) => axios.get(URLS.directory(directoryId)),
  createDirectory: (directoryId = 0, title) => axios.post(URLS.directory(directoryId), { title }),
  renameDirectory: (directoryId, title) => axios.put(URLS.directory(directoryId), { title }),
  deleteDirectory: (directoryId) => axios.delete(URLS.directory(directoryId)),

  createRecording: (directoryId = 0, title) => axios.post(URLS.createRecording(directoryId), { title }),
  renameRecording: (directoryId, recordingId, title) =>
    axios.put(URLS.recording(directoryId, recordingId), { title }),
  deleteRecording: (directoryId, recordingId, title) =>
    axios.delete(URLS.recording(directoryId, recordingId)),
};

export default dashBoardApi;
