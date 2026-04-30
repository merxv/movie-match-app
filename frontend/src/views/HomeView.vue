<template>
  <div class="text-center py-20">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">Welcome to MovieMatch!</h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Discover movies, like your favorites, and get personalized recommendations based on tags and similar users.</p>
    <div class="space-x-4">
      <router-link 
        v-if="!user" 
        to="/login" 
        class="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 shadow-lg transition transform hover:-translate-y-1"
      >
        Login
      </router-link>
      <router-link 
        v-if="!user" 
        to="/register" 
        class="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 shadow-lg transition transform hover:-translate-y-1"
      >
        Register
      </router-link>
      <span
        v-else
        class="inline-block bg-indigo-500 text-white px-8 py-4 rounded-lg shadow-lg"
      >
        You are logged in
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>
