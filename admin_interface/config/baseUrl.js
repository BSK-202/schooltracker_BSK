// config/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'https://cc3e28e3-5a5d-4597-a04c-5700ae0214bc.mock.pstmn.io'
  : 'https://api.tondomaine.com';

export default API_BASE_URL;