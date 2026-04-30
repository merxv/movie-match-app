<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <input 
            v-model="username" 
            type="text" 
            placeholder="Username" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Password" 
            required 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Register
        </button>
      </form>
      <p class="text-center mt-4 text-gray-600">
        Have account? <router-link to="/login" class="text-green-500 hover:underline">Login</router-link>
      </p>
      <p v-if="error" class="text-center mt-4 text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleRegister = async () => {
  try {
    error.value = '';
    await authStore.register(username.value, email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Register failed';
  }
};
</script>
