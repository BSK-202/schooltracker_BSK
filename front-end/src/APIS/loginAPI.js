import axios from "axios";
const loginAPI = axios.create({
    baseURL: "http://192.168.0.156:3000",
    timeout: 5000,
    headers:{
        "Content-Type":"application/json",
    },
});

export default loginAPI;