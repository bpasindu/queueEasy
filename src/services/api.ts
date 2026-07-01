import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android emulator to access localhost, and localhost for iOS
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
