import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js'; // Импорт на топе — синхронно
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/movies', name: 'movies', component: () => import('../views/MoviesView.vue'), meta: { requiresAuth: true } },
    { path: '/recommendations', name: 'recommendations', component: () => import('../views/RecommendationsView.vue'), meta: { requiresAuth: true } },
    { path: '/search/:query?', name: 'search', component: () => import('../views/SearchResultsView.vue'), meta: { requiresAuth: true } },
    { path: '/genres', name: 'genres', component: () => import('../views/GenresView.vue'), meta: { requiresAuth: true } },
    { path: '/genres/:genre', name: 'genreResults', component: () => import('../views/GenreResultsView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } }
  ]
});

// Guard: синхронный, с try-catch
router.beforeEach((to, from) => {
  try {
    const authStore = useAuthStore(); // Теперь определён (импорт на топе)
    if (to.meta.requiresAuth && !authStore.user) {
      return { name: 'login' };
    }
  } catch (err) {
    console.error('Router guard error:', err);
    return { name: 'login' }; // Fallback на login при любой ошибке
  }
});

export default router;