import axios from "axios";
const loginAPI = axios.create({
    baseURL: "https://11f26a6a-c192-4f3b-9089-e0ab8752b839.mock.pstmn.io",
    timeout: 5000,
    headers:{
        "Content-Type":"application/json",
    },
});

export default loginAPI;