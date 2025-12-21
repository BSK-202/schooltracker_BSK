import axios from "axios";
const loginAPI = axios.create({
    baseURL: "https://cc3e28e3-5a5d-4597-a04c-5700ae0214bc.mock.pstmn.io",
    timeout: 5000,
    headers:{
        "Content-Type":"application/json",
    },
});

export default loginAPI;