import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import Cookies from 'universal-cookie';

const BACKEND_HOST = window._env_.REACT_APP_BACKEND_HOST;
const SSL_ENABLED = window._env_.REACT_APP_SSL_ENABLED.toLowerCase() === 'true';
const HTTP_PROTOCOL = SSL_ENABLED ? 'https://' : 'http://';
export const API_BASE_URL = HTTP_PROTOCOL + BACKEND_HOST;

axios.interceptors.request.use((request) => {
  request.withCredentials = true;
  const cookies = new Cookies();
  const token = cookies.get('X-JR_CSRFTOKEN');
  if (request.method !== 'GET' && token) {
    request.headers['X-CSRFToken'] = token;
  }
  return request;
});

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!error.response?.status)
      showNotification({
        color: 'red',
        title: 'Network Error',
        message: 'Cannot connect to server',
      });
    else throw error;
  }
);
