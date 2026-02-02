import axios, { type AxiosError } from 'axios';

let BASE_URL: string;

if (import.meta.env.MODE === 'production') {
  console.log('Running in Production Mode');
  BASE_URL = 'https://referral-system-backend.fly.dev/api';
} else {
  console.log('Running in Development Mode');
  BASE_URL = 'https://referral-system-backend.fly.dev/api';
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const logErrorToConsole = (error: AxiosError) => {
  console.error('API Error:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  });
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    logErrorToConsole(error);

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error);
  }
);

export const get = async <T = any>(
  url: string,
  params: Record<string, any> = {},
  config: any = {}
): Promise<T> => {
  const response = await axiosInstance.get(url, { params, ...config });
  return response.data;
};

export const post = async <T = any>(url: string, data: any): Promise<T> => {
  const response = await axiosInstance.post(url, data);
  return response.data;
};

export const put = async <T = any>(url: string, data: any): Promise<T> => {
  const response = await axiosInstance.put(url, data);
  return response.data;
};

export const patch = async <T = any>(url: string, data: any): Promise<T> => {
  const response = await axiosInstance.patch(url, data);
  return response.data;
};

export const _delete = async <T = any>(url: string): Promise<T> => {
  const response = await axiosInstance.delete(url);
  return response.data;
};

export const postBlob = async (
  url: string,
  data: any = {},
  config: any = {}
) => {
  return axiosInstance.post(url, data, { responseType: 'blob', ...config });
};

export const uploadFile = async <T = any>(
  url: string,
  formData: FormData,
  config: any = {}
): Promise<T> => {
  const response = await axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
  return response.data;
};

export default axiosInstance;