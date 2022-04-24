import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import Cookies from 'universal-cookie';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

axios.interceptors.request.use((request) => {
  request.withCredentials = true;
  const cookies = new Cookies();
  const token = cookies.get('X-CSRFTOKEN');
  console.log('token', token);
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
