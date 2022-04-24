import axios from 'axios';

import { API_BASE_URL } from './base';

const URLS = {
  login: `${API_BASE_URL}/auth/login`,
  signUp: `${API_BASE_URL}/auth/sign_up`,
  logout: `${API_BASE_URL}/auth/logout`,
  userInfo: `${API_BASE_URL}/auth/user_info`,
};

const authApi = {
  login: (email, password) => axios.post(URLS.login, { email, password }),
  signUp: (email, first_name, last_name, password) =>
    axios.post(URLS.signUp, { email, first_name, last_name, password }),
  logout: () => axios.post(URLS.logout),
  getUserInfo: () => axios.get(URLS.userInfo),
};

export default authApi;
