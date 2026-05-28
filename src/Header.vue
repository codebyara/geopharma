<template>
  <header class="bg-surface-container border-b border-outline-variant sticky top-0 z-50">
    <nav class="container mx-auto px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center">
      <RouterLink to="/" class="flex items-center space-x-2 hover:opacity-80">
        <div class="text-lg font-bold text-primary font-sora">GEO-PHARMA</div>
      </RouterLink>
      
      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-8">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/smart-relief" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Smart Relief</RouterLink>
          <RouterLink to="/water-sanitation" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Water & Sanitation</RouterLink>
          <RouterLink to="/early-warning" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Early Warning</RouterLink>
          <RouterLink to="/drone-tracking" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Drone Tracking</RouterLink>
          <RouterLink to="/dashboard" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Dashboard</RouterLink>
        </template>
        <template v-else>
          <a href="#about" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Tentang Kami</a>
          <a href="#features" class="text-on-surface-variant hover:text-primary transition text-body-md font-mono">Fitur</a>
        </template>
      </div>

      <div class="flex items-center space-x-4">
        <!-- User Avatar & Dropdown / Login Button -->
        <div class="hidden md:flex items-center relative gap-4">
          <template v-if="auth.isAuthenticated">
            <!-- Icon Notification -->
            <div class="relative cursor-pointer flex items-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.8" class="text-on-surface-variant hover:text-primary transition">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>

            <!-- Avatar -->
            <div 
              class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold cursor-pointer select-none"
              @click="toggleUserDropdown"
              :title="auth.user.name"
            >
              {{ auth.user.initials }}
            </div>

            <!-- Dropdown Menu -->
            <div v-if="userDropdownOpen" class="absolute top-12 right-0 bg-surface border border-outline-variant rounded-lg min-w-[200px] shadow-lg z-50 overflow-hidden">
              <div class="p-4 border-b border-outline-variant">
                <p class="text-sm font-bold text-on-surface m-0">{{ auth.user.name }}</p>
                <p class="text-xs text-on-surface-variant capitalize m-0 mt-1">{{ auth.user.role }}</p>
              </div>
              <button @click="handleLogout" class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-surface-variant transition cursor-pointer">
                Logout
              </button>
            </div>
          </template>
          <template v-else>
            <button @click="handleLogin" class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition font-mono text-label-caps">
              LOGIN
            </button>
          </template>
        </div>

        <button @click="toggleMobileMenu" class="md:hidden text-2xl text-primary">
          {{ mobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-surface-container-high border-t border-outline-variant">
      <div class="container mx-auto px-margin-mobile py-4 space-y-3">
        <template v-if="auth.isAuthenticated">
          <div class="flex items-center gap-3 px-2 py-2 mb-2 border-b border-outline-variant">
             <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
              {{ auth.user.initials }}
            </div>
            <div>
              <p class="text-sm font-bold text-on-surface m-0">{{ auth.user.name }}</p>
              <p class="text-xs text-on-surface-variant capitalize m-0">{{ auth.user.role }}</p>
            </div>
          </div>
          <RouterLink @click="mobileMenuOpen = false" to="/smart-relief" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Smart Relief</RouterLink>
          <RouterLink @click="mobileMenuOpen = false" to="/water-sanitation" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Water & Sanitation</RouterLink>
          <RouterLink @click="mobileMenuOpen = false" to="/early-warning" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Early Warning</RouterLink>
          <RouterLink @click="mobileMenuOpen = false" to="/drone-tracking" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Drone Tracking</RouterLink>
          <RouterLink @click="mobileMenuOpen = false" to="/dashboard" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Dashboard</RouterLink>
          <button @click="handleLogoutMobile" class="block w-full text-left py-2 text-red-600 font-mono text-body-md mt-2">
            Logout
          </button>
        </template>
        <template v-else>
          <a @click="mobileMenuOpen = false" href="#about" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Tentang Kami</a>
          <a @click="mobileMenuOpen = false" href="#features" class="block py-2 text-on-surface hover:text-primary font-mono text-body-md">Fitur</a>
          <button @click="handleLoginMobile" class="block w-full py-2 px-4 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition font-mono text-label-caps mt-4">
            LOGIN
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { supabase } from './services/supabase' // 1. Tambahkan import supabase di sini

const auth = useAuthStore()
const router = useRouter()

const mobileMenuOpen = ref(false)
const userDropdownOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
}

// Jalur login langsung diarahkan ke halaman login resmi kamu
const handleLogin = () => {
  router.push('/login')
}

const handleLoginMobile = () => {
  handleLogin()
  mobileMenuOpen.value = false
}

// 2. Ubah fungsi logout menjadi async untuk membersihkan sesi Supabase
const handleLogout = async () => {
  await supabase.auth.signOut() // Hapus token dari localStorage browser
  auth.logout()                 // Reset status di Pinia store
  userDropdownOpen.value = false
  router.push('/')              // Tendang kembali ke landing page awal
}

const handleLogoutMobile = async () => {
  await handleLogout()
  mobileMenuOpen.value = false
}
</script>

<style scoped>
header {
  background: linear-gradient(135deg, #e4e7e4 0%, #fdfdfd 100%);
}
</style>
