import axios from "axios";
import API_BASE_URL from "../config/baseUrl";

const loginAPI = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers:{
        "Content-Type":"application/json",
    },
});
export default loginAPI;