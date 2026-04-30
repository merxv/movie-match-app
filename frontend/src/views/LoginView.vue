<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Password" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          Login
        </button>
      </form>
      <p class="text-center mt-4 text-gray-600">
        No account? <router-link to="/register" class="text-blue-500 hover:underline">Register</router-link>
      </p>
      <p v-if="error" class="text-center mt-4 text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    error.value = '';
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed';
  }
};
</script>
