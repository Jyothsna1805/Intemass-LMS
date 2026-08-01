import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 90000, // 90 seconds (handles Render cold start)
});

api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
