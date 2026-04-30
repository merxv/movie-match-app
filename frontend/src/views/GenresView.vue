<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Browse by Genre</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="genre in genres" 
        :key="genre" 
        :to="`/genres/${genre}`" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
        :style="{ borderLeft: `5px solid ${genreColors[genre] || '#gray'}` }" 
      >
        <div :class="`h-48 flex items-center justify-center ${genreGradients[genre] || 'bg-gray-400'}`">
          <span class="text-white text-4xl opacity-80 group-hover:opacity-100 transition">{{ genreIcons[genre] || '🎬' }}</span>
          <span class="text-white text-2xl font-bold ml-2 opacity-80 group-hover:opacity-100 transition">{{ genre }}</span>
        </div>
        <div class="p-6 text-center">
          <p class="text-gray-700 font-medium">Explore {{ genre }} movies</p>
        </div>
      </router-link>
    </div>
    <div class="mt-8 text-center">
      <router-link to="/movies" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition">Back to All Movies</router-link>
    </div>
  </div>
</template>

<script setup>
const genres = [
  'Sci-Fi', 'Drama', 'Mystery', 'Thriller', 'Adventure', 'Action', 'Comedy', 'Horror', 'Romance', 'Fantasy'
];

// Map для иконок (emojis)
const genreIcons = {
  'Sci-Fi': '🚀',
  'Drama': '🎭',
  'Mystery': '🔍',
  'Thriller': '💥',
  'Adventure': '🗺️',
  'Action': '⚔️',
  'Comedy': '😂',
  'Horror': '👻',
  'Romance': '💕',
  'Fantasy': '🧙‍♂️'
};

// Map для градиентов (цвета)
const genreGradients = {
  'Sci-Fi': 'bg-gradient-to-r from-blue-500 to-indigo-600',
  'Drama': 'bg-gradient-to-r from-red-500 to-pink-600',
  'Mystery': 'bg-gradient-to-r from-purple-500 to-violet-600',
  'Thriller': 'bg-gradient-to-r from-orange-500 to-red-600',
  'Adventure': 'bg-gradient-to-r from-green-500 to-teal-600',
  'Action': 'bg-gradient-to-r from-yellow-500 to-orange-600',
  'Comedy': 'bg-gradient-to-r from-pink-500 to-rose-600',
  'Horror': 'bg-gradient-to-r from-gray-700 to-black',
  'Romance': 'bg-gradient-to-r from-rose-500 to-pink-600',
  'Fantasy': 'bg-gradient-to-r from-indigo-500 to-purple-600'
};

// Map для border colors (левый бордер)
const genreColors = {
  'Sci-Fi': '#3b82f6',
  'Drama': '#ef4444',
  'Mystery': '#8b5cf6',
  'Thriller': '#f97316',
  'Adventure': '#10b981',
  'Action': '#eab308',
  'Comedy': '#ec4899',
  'Horror': '#374151',
  'Romance': '#f43f5e',
  'Fantasy': '#6366f1'
};
</script>