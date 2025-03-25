import axios from 'axios';
import { ACCESS_TOKEN } from './constants';

const request = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      console.log("bI");
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("HI");
    console.log(config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;