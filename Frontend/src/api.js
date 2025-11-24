import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const fetchAll = () => axios.get(`${API_BASE}/requests`).then(r => r.data);
export const fetchSorted = () => axios.get(`${API_BASE}/requests/sorted`).then(r => r.data);
export const searchTitle = (title) => axios.get(`${API_BASE}/requests/search`, { params: { title } }).then(r => r.data);
export const createRequestWithImage = (formData) => axios.post(`${API_BASE}/request`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);
export const deleteRequest = (id) => axios.delete(`${API_BASE}/request/${id}`).then(r => r.data);
export const API_BASE_URL = API_BASE;
