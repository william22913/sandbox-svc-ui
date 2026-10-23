import axios from 'axios';
import { redirectToLogin } from '../../../helpers/redirectToLogin';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // REQ-006 / REQ-012: any 401 sends the visitor to login with a return path.
    if (error?.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default client;
