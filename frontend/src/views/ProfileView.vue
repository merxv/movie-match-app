<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Profile</h1>
      <router-link to="/movies" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">← Back to Movies</router-link>
    </div>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Loading profile...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error: {{ error }}</p>
      <button @click="loadProfile" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Retry</button>
    </div>
    <div v-else>
      <!-- Инфо пользователя -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">User Info</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><span class="font-medium text-gray-600">Username:</span> {{ profile.username }}</p>
          <p><span class="font-medium text-gray-600">Email:</span> {{ profile.email }}</p>
          <p><span class="font-medium text-gray-600">Role:</span> <span :class="profile.role === 'admin' ? 'text-green-600' : 'text-blue-600'">{{ profile.role.toUpperCase() }}</span></p>
        </div>
      </div>

      <!-- Лайкнутые фильмы -->
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Liked Movies ({{ profile.likedMovies.length }})</h2>
      <div v-if="profile.likedMovies.length === 0" class="text-center py-8 text-gray-600">
        No liked movies yet. Go like some!
        <router-link to="/movies" class="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Movies</router-link>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="movie in profile.likedMovies" :key="movie._id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
          <div class="w-full aspect-[2/3] overflow-hidden rounded-lg">
          <img
            v-if="movie.bannerUrl"
            :src="movie.bannerUrl"
            :alt="movie.title"
            class="w-full h-full object-cover"
          >
          <div v-else class="bg-gray-300 w-full h-full flex items-center justify-center">
            <span class="text-gray-500 text-sm">Movie Poster</span>
          </div>
        </div>
          <div class="p-4 flex flex-col flex-1">
            <h3 class="text-xl font-semibold mb-2 text-gray-800">{{ movie.title || 'Unknown Title' }} <span v-if="movie.year" class="text-gray-600 text-sm">({{ movie.year }})</span><span v-else class="text-gray-600 text-sm">(N/A)</span></h3>
            <p v-if="movie.genre && movie.genre.length" class="text-sm text-gray-600 mb-2">Genres: {{ movie.genre.join(', ') }}</p>
            <p v-if="movie.description" class="text-gray-600 text-sm mb-4 line-clamp-3">{{ movie.description }}</p>
            <p v-else class="text-gray-500 text-sm italic mb-4">No description available</p>
            <div class="mt-auto">
            <p class="text-xs text-gray-500 mb-4">Liked on: {{ movie.likeTimestamp || 'Unknown date' }}</p>
            <button 
              v-if="movie._id" 
              @click="unlikeMovie(movie._id)" 
              class="w-full py-2 rounded font-semibold transition bg-green-500 text-white hover:bg-green-600"
            >
              Liked ✓
            </button>
            <p v-else class="text-red-500 text-sm">Error: Missing movie ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const error = ref('');

const loadProfile = async () => {
  loading.value = true;
  error.value = '';
  try {
    profile.value = await authStore.fetchProfile();
    console.log('Frontend profile likedMovies:', profile.value.likedMovies); // Debug в браузере Console
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Failed to load profile';
    console.error('Profile error:', err);
    profile.value = null;
  } finally {
    loading.value = false;
  }
};

const unlikeMovie = async (movieId) => {
  if (!movieId) {
    alert('Movie ID missing');
    return;
  }
  try {
    await authStore.toggleLike(movieId); // Toggle сделает unlike (поскольку liked)
    loadProfile(); // Refresh
  } catch (err) {
    alert('Unlike failed: ' + (err.response?.data?.message || err.message));
  }
};


onMounted(loadProfile);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>