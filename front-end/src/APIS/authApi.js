import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from "../config/baseUrl";

const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers:{
        "Content-Type":"application/json",
    },
});

authApi.interceptors.request.use(
    async(config) =>{
        const token = await SecureStore.getItemAsync('acces_token');
        if(token){
            config.headers.Authorization= `Bearer ${token}`;
        }
        return config;
    },(error) =>{
        return Promise.reject(error);
    }
)
export default authApi;
