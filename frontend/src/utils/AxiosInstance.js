import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1", // or your deployed backend URL
  withCredentials: true,
});

export default axiosInstance;
