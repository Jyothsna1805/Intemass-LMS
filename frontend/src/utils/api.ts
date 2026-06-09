import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000, // 30 seconds
});

api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
