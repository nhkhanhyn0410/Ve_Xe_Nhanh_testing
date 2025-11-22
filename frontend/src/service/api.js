import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api/v1';

// Tạo phiên bản axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây
});

// Yêu cầu chặn
api.interceptors.request.use(
    (config) => {
        // Nhận mã thông báo từ bộ lưu trữ liên tục Zustand (bộ lưu trữ xác thực)
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
            try {
                const { state } = JSON.parse(authData);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
            }
        }

        // Nhận mã thông báo phiên khách nếu có
        const guestToken = localStorage.getItem('guest-token');
        if (guestToken && !config.headers.Authorization) {
            config.headers['x-guest-token'] = guestToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Đánh chặn phản hồi
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle errors
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('auth-storage'); // Khóa liên tục trạng thái
                localStorage.removeItem('guest-token');

                // Chuyển hướng dựa trên đường dẫn hiện tại
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                } else if (currentPath.startsWith('/operator')) {
                    window.location.href = '/operator/login';
                } else if (currentPath.startsWith('/trip-manager')) {
                    window.location.href = '/trip-manager/login';
                } else {
                    window.location.href = '/login';
                }
            }

            // Trả về toàn bộ error object với cấu trúc chuẩn từ backend
            // Backend format: { status: 'fail'/'error', message: '...', ... }
            const errorResponse = {
                status: data?.status || 'error',
                message: data?.message || 'Đã có lỗi xảy ra',
                statusCode: status,
                // Giữ lại data gốc cho trường hợp cần debug
                ...(process.env.NODE_ENV === 'development' && { originalError: data }),
            };

            return Promise.reject(errorResponse);
        } else if (error.request) {
            // Yêu cầu được đưa ra nhưng không có phản hồi (network error)
            return Promise.reject({
                status: 'error',
                message: 'Không thể kết nối đến server',
                statusCode: 0,
                isNetworkError: true,
            });
        } else {
            // Có điều gì đó khác đã xảy ra (config error, etc.)
            return Promise.reject({
                status: 'error',
                message: error.message || 'Đã có lỗi xảy ra',
                statusCode: 0,
            });
        }
    }
);

export default api;

// Export common API methods
export const apiMethods = {
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    patch: (url, data, config) => api.patch(url, data, config),
    delete: (url, config) => api.delete(url, config),
};
