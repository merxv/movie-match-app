<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Movies</h1>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Loading movies...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error: {{ error }}</p>
      <button @click="loadMovies" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Retry</button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="movie in movies" :key="movie._id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
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
          <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ movie.title }} <span class="text-gray-600 text-sm">({{ movie.year || 'N/A' }})</span></h2>
          <p v-if="movie.genre && movie.genre.length" class="text-sm text-gray-600 mb-2">Genres: {{ movie.genre.join(', ') }}</p>
          <p v-if="movie.description" class="text-gray-600 text-sm mb-4 line-clamp-3">{{ movie.description }}</p>
          <p v-else class="text-gray-500 text-sm italic mb-4">No description available</p>
          <button 
            @click="toggleLike(movie._id)" 
            class="w-full py-2 rounded font-semibold transition mt-auto"
            :class="isLiked(movie._id) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 text-white hover:bg-blue-600'"
          >
            {{ isLiked(movie._id) ? 'Liked ✓' : 'Like' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="!loading && !error && movies.length === 0" class="text-center mt-8 text-gray-600">
      No movies yet. <button @click="loadMovies" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Reload</button>
    </div>
    <div class="mt-8 text-center">
      <router-link to="/recommendations" class="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">View Recommendations</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const movies = ref([]);
const loading = ref(true);
const error = ref('');

const loadMovies = async () => {
  loading.value = true;
  error.value = '';
  try {
    movies.value = await authStore.fetchMovies();
    await authStore.getUserLikes(); // Загружаем likes
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Failed to load';
    movies.value = [];
  } finally {
    loading.value = false;
  }
};

const isLiked = (movieId) => {
  return authStore.likedMovies.includes(movieId);
};

const toggleLike = async (movieId) => {
  try {
    await authStore.toggleLike(movieId);
    // Refresh likes if needed
  } catch (err) {
    alert('Toggle failed: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(loadMovies);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>