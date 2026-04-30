<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
      <nav class="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
        <h1 class="text-2xl font-bold">
          <router-link to="/" class="hover:text-gray-200">MovieMatch</router-link>
        </h1>
        <div class="flex gap-4 items-center">
          <!-- Поиск -->
          <form @submit.prevent="handleSearch" class="flex bg-white rounded-lg p-2 shadow-sm">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by title..." 
              class="outline-none px-3 py-1 text-gray-800 placeholder-gray-500 w-48 md:w-64"
            />
            <button type="submit" class="text-blue-600 hover:text-blue-800 ml-2">🔍</button>
          </form>
          <!-- Навигация -->
          <template v-if="user">
            <router-link to="/movies" class="hover:text-gray-200 transition">Movies</router-link>
            <router-link to="/genres" class="hover:text-gray-200 transition">Genres</router-link>
            <router-link to="/recommendations" class="hover:text-gray-200 transition">Recommendations</router-link>
            <router-link to="/profile" class="hover:text-gray-200 transition">Profile</router-link>
            <button @click="logout" class="bg-red-500 hover:bg-red-700 px-4 py-2 rounded transition">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="hover:text-gray-200 transition">Login</router-link>
            <router-link to="/register" class="hover:text-gray-200 transition">Register</router-link>
          </template>
        </div>
      </nav>
    </header>
    <main class="pt-20 max-w-6xl mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // ← Добавь ref
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const searchQuery = ref(''); // ← ref для v-model

const logout = () => {
  authStore.logout();
  router.push('/');
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`);
  } else {
    router.push('/movies'); // Fallback
  }
};
</script>