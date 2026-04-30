<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Search Results for "{{ searchQuery }}"</h1>
      <router-link to="/movies" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">← Back to Movies</router-link>
    </div>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Searching...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error: {{ error }}</p>
      <button @click="loadMovies" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Retry</button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="movie in filteredMovies" :key="movie._id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
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
    <div v-if="!loading && !error && filteredMovies.length === 0" class="text-center mt-8 text-gray-600">
      No movies found for "{{ searchQuery }}". Try another search!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const authStore = useAuthStore();
const allMovies = ref([]);
const loading = ref(true);
const error = ref('');

const searchQuery = computed(() => decodeURIComponent(route.params.query || ''));

const loadMovies = async () => {
  loading.value = true;
  error.value = '';
  try {
    allMovies.value = await authStore.fetchMovies(); // Используем fetchMovies
    console.log('Search loaded:', allMovies.value.length, 'Query:', searchQuery.value); // Debug
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Failed to load';
    console.error('Search load error:', err);
    allMovies.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredMovies = computed(() => {
  if (!allMovies.value.length) return [];
  return allMovies.value.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isLiked = (movieId) => {
  return authStore.likedMovies.includes(movieId);
};

const toggleLike = async (movieId) => {
  try {
    await authStore.toggleLike(movieId);
  } catch (err) {
    alert('Toggle failed: ' + (err.response?.data?.message || err.message));
  }
};

onMounted(async () => {
  await authStore.getUserLikes(); // Загружаем likes
  loadMovies();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>