import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

export const getStats       = ()        => http.get('/stats').then(r => r.data);
export const registerUser   = (name)    => http.post('/register', { name }).then(r => r.data);
export const submitScore    = (payload) => http.post('/submit', payload).then(r => r.data);
export const getLeaderboard = ()        => http.get('/leaderboard').then(r => r.data);
