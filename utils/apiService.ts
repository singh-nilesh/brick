// apiService.ts
import axios from 'axios';

const API_URL = 'https://brick-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Don't attach token in interceptor
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Now normal methods
export const fetchPosts = async () => {
  return (await api.get('/get-posts')).data;
};

export const generatePlan = async (goal: string, habitCount: number, tasksCount: number, extraContent: string) => {
  return (await api.post('/generate-plan', { goal, habitCount, tasksCount, extraContent })).data;
};

export const createPost = async (userId: string, context: string, roadmap: string) => {
  return (await api.post('/add-post', { context, contextImg: '', roadmap })).data;
};

export const updatePostLikes = async (postId: string, userId: string, isAdding: boolean) => {
  const action = isAdding ? 'add' : 'remove';
  return (await api.put('/update-post', { postId, userId, action })).data;
};
