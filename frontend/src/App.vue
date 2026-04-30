<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white shadow-lg fixed w-full top-0 z-50">
      <nav class="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
        <h1 class="text-2xl font-bold">
          <router-link to="/" class="hover:text-gray-200">MovieMatch</router-link>
        </h1>
        <div class="flex gap-4 items-center">
          <template v-if="user">
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>
