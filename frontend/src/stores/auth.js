import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Восстанавливаем токен при загрузке (localStorage)
const token = ref(localStorage.getItem('token') || null);
if (token.value) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  // Login
  const login = async (email, password) => {
    const res = await api.post('/api/users/login', { email, password }); // Или /api/users/login
    token.value = res.data.token;
    user.value = res.data.user;
    localStorage.setItem('token', token.value);
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  };

  // Register
  const register = async (username, email, password) => {
    const res = await api.post('/api/users/register', { username, email, password });
    user.value = res.data;
    // Опционально: авто-login после register
    await login(email, password);
  };

  // Logout
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  // Movies
  const fetchMovies = async () => {
    const res = await api.get('/api/movies');
    return res.data;
  };

  // Like
  const likeMovie = async (movieId) => {
    await api.post(`/api/users/like/${movieId}`); // Или /api/users/like
    // Опционально: refresh movies list
  };

  // Recommendations
  const getRecommendations = async () => {
    const res = await api.get('/api/recommend'); // Просто /
    return res.data;
  };

  const likedMovies = ref([]); // Кэш liked IDs

  const profile = ref(null); // Кэш профиля

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/users/profile');
      profile.value = res.data; // { username, email, role, likedMovies: [...] }
      return profile.value;
    } catch (err) {
      console.error('Profile fetch error:', err);
      throw err;
    }
  };

  const getUserLikes = async () => {
    try {
      const res = await api.get('/api/users/me');
      likedMovies.value = res.data.likedMovies || [];
      return likedMovies.value;
    } catch (err) {
      console.error('Get likes error:', err);
      throw err;
    }
  };

  const toggleLike = async (movieId) => {
    try {
      const isLiked = likedMovies.value.includes(movieId);
      if (isLiked) {
        await api.delete(`/api/users/unlike/${movieId}`); 
        likedMovies.value = likedMovies.value.filter(id => id !== movieId);
      } else {
        await api.post(`/api/users/like/${movieId}`); 
        likedMovies.value.push(movieId);
      }
    } catch (err) {
      throw err;
    }
  };

  return { user, token, login, register, logout, fetchMovies, likeMovie, getRecommendations, getUserLikes, toggleLike, likedMovies, fetchProfile, profile };
});