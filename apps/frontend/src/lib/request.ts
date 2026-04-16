import axios from 'axios';
import qs from 'qs';
// import { Toaster } from "@/components/ui/sonner"
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const mainHost = () => {
    // 线上环境
    return process.env.NODE_ENV
        ? `${location.protocol}//${location.hostname}:3000`
        : location.origin;
};

export const service = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 60000, // request timeout
    paramsSerializer: function (params) {
        return qs.stringify(params);
    },
});

// Request interceptor to add auth token
service.interceptors.request.use(
    (config) => {
        // do something before request is sent
        // const type = config.contentType || 'application/json';
        config.headers['Content-Type'] = 'application/json';
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor to handle errors
service.interceptors.response.use(
    (response) => response,
    (error) => {
        // // 错误信息提示
        let errText = '';
        if (error.response) {
            const { status, data } = error.response;
            if (status === 504 || status === 500) errText = '抱歉,服务器异常!';
            if (status === 403) errText = '抱歉,你无权访问该页面!';
            if (status !== 401 && data?.message) errText = data.message;
        } else if (error.request) {
            if (error.message == 'timeout of 15000ms exceeded') errText = '抱歉,请求超时!';
            else errText = '抱歉,系统错误!';
        } else {
            errText = '抱歉,系统错误!';
        }

        // token失效状态码不需要提示
        if (errText && ![401, 426].includes(error.response.status)) {
            // 错误提示
            toast.error(errText);
        }

        // 错误处理
        if (error.response) {
            // 进行无感刷新
            const { status, config, data } = error.response;
            // if (status == 401 && !isRefreshRequest(config)) {
            // const isSuccess = await refreshTokenApi()
            // if (isSuccess) {
            // 	return service(config)
            // } else {
            // 	// 移除登录缓存数据 并重新加载页面
            // 	const { resetToken } = useAccessTokenStore()
            // 	resetToken().then(() => {
            // 		location.reload()
            // 	})
            // }
            // }

            // 刷新token请求 报错 直接进行登录页跳转
            if (status == 426 || status === 401) {
                setTimeout(() => {
                    // 刷新令牌报错应该前往OA系统
                    window.location.href = mainHost();
                }, 1500);
            }

            if (status == 403) {
                // 跳转403
            }
            if (status == 500) {
                // 跳转500
            }

            return Promise.reject((status && data) || { code: 1, message: errText });
        }

        if (error.request && error.message == 'timeout of 15000ms exceeded') {
            return Promise.reject({ code: 1, message: errText });
        }

        // 错误信息 返回必须用Promise.reject, 若否，则会自动进入Promise.resolve
        return Promise.reject({ code: 1, message: errText });

        // if (error.response?.status === 401) {
        //     localStorage.removeItem('token');
        //     window.location.href = '/login';
        // }
        // return Promise.reject(error);
    },
);

export default service;
