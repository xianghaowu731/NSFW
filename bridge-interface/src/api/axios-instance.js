import axios from "axios";

const _axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    authorization: "Bearer API_KEY_FOR_BRIDGE",
  },
});

export const axiosInstance = _axiosInstance;
