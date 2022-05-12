import axios from 'axios';

import { API_BASE_URL } from './base';

const URLS = {
  updateUserInfo: `${API_BASE_URL}/auth/user_info`,
  changePassword: `${API_BASE_URL}/auth/change_password`,
};

const dashBoardApi = {
  updateUserInfo: (first_name, last_name) => axios.put(URLS.updateUserInfo, { first_name, last_name }),
  changePassword: (old_password, new_password) =>
    axios.post(URLS.changePassword, { old_password, new_password }),
};

export default dashBoardApi;
