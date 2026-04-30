<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Recommendations</h1>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Loading recommendations...</p>
    </div>
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error: {{ error }}</p>
      <button @click="loadRecommendations" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Retry</button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="rec in recommendations" :key="rec.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
        <div class="w-full aspect-[2/3] overflow-hidden rounded-lg">
          <img
            v-if="rec.bannerUrl"
            :src="rec.bannerUrl"
            :alt="rec.title"
            class="w-full h-full object-cover"
          >
          <div v-else class="bg-gray-300 w-full h-full flex items-center justify-center">
            <span class="text-gray-500 text-sm">Movie Poster</span>
          </div>
        </div>
        <div class="p-4 flex flex-col flex-1">
          <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ rec.title }}</h2>
          <p v-if="rec.genre && rec.genre.length" class="text-sm text-gray-600 mb-2">Genres: {{ rec.genre.join(', ') }}</p>
          <p v-if="rec.description" class="text-gray-600 text-sm mb-4 line-clamp-3">{{ rec.description }}</p>
          <p v-else class="text-gray-500 text-sm italic mb-4">No description available</p>
          <div class="mt-auto">
            <p class="text-sm text-blue-600 font-medium mb-2">
              Score: {{ rec.relevanceScore }}
              (Content: {{ rec.contentScore }}, Collab: {{ rec.collabScore }})
            </p>

            <button
              @click="toggleLike(rec.id)"
              class="w-full py-2 rounded font-semibold transition"
              :class="isLiked(rec.id)
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'"
            >
              {{ isLiked(rec.id) ? 'Liked ✓' : 'Like' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loading && !error && recommendations.length === 0" class="text-center mt-8 text-gray-600">
      No recommendations yet. Like some movies to get personalized suggestions!
      <router-link to="/movies" class="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Browse Movies</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();
const recommendations = ref([]);
const allMovies = ref([]); // Для genres/desc
const loading = ref(true);
const error = ref('');

const loadRecommendations = async () => {
  loading.value = true;
  error.value = '';
  try {
    allMovies.value = await authStore.fetchMovies(); // Загружаем все для genres/desc
    recommendations.value = await authStore.getRecommendations();
    // Добавляем genres/desc из allMovies
    recommendations.value = recommendations.value.map(rec => {
      const fullMovie = allMovies.value.find(m => m._id === rec.id);
      return { ...rec, genre: fullMovie?.genre || [], description: fullMovie?.description || '', bannerUrl: fullMovie?.bannerUrl || null };
    });
    console.log('Recommendations loaded:', recommendations.value.length); // Debug
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Failed to load';
    console.error('Recs load error:', err);
    recommendations.value = [];
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
  } catch (err) {
    alert('Toggle failed: ' + (err.response?.data?.message || err.message));
  }
};


onMounted(async () => {
  await authStore.getUserLikes(); // Загружаем likes
  loadRecommendations();
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