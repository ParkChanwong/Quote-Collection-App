import axios from 'axios';

// 어드민과 동일한 API 서버를 사용합니다.
export const API_BASE_URL = 'https://quote-collection-odpj.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});
