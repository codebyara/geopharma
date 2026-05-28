<template>
  <div class="min-h-screen flex">
    <div 
      class="hidden lg:flex lg:w-3/5 bg-cover bg-center relative" 
      style="background-image: url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop');"
    >
      <div class="absolute inset-0 bg-green-900 bg-opacity-60 flex flex-col justify-center px-16">
        <h1 class="text-5xl font-bold text-white mb-4">GeoPharma</h1>
        <p class="text-xl text-gray-200">
          Indonesia's First Geo-Pharmaceutical Disaster Intelligence Platform
        </p>
      </div>
    </div>

    <div class="w-full lg:w-2/5 flex items-center justify-center bg-white p-8 lg:p-16">
      <div class="w-full max-w-md">
        <h2 class="text-3xl font-bold text-green-800 mb-2 lg:hidden">GeoPharma</h2>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3>
        <p class="text-gray-500 mb-8">Silakan masuk ke dashboard intelijen Anda.</p>

        <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              v-model="email" 
              type="email" 
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="admin@geo-pharma.id"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              v-model="password" 
              type="password" 
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              placeholder="••••••••"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" class="rounded text-green-600 focus:ring-green-500 h-4 w-4">
              <span class="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" class="text-sm font-medium text-green-600 hover:text-green-500">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
          >
            {{ loading ? 'Memproses...' : 'Login ke Dashboard' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js'

export default defineComponent({
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.loading = true
        this.errorMessage = ''

        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        })

        if (error) throw error

        // Jika berhasil, arahkan ke halaman Dashboard
        this.$router.push('/dashboard')
        
      } catch (error) {
        this.errorMessage = error.message || 'Terjadi kesalahan saat login.'
      } finally {
        this.loading = false
      }
    }
  }
})
</script>