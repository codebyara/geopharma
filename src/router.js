import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './services/supabase.js' // Pastikan path ini benar
import Landing from './Landing.vue'
import Login from './Login.vue'
import Dashboard from './Dashboard.vue'
import Report from './Report.vue'
import SmartReliefAllocation from './SmartReliefAllocation.vue'
import WaterSanitation from './WaterSanitation.vue'
import EarlyWarningSystem from './EarlyWarningSystem.vue'
import DroneTracking from './DroneTracking.vue'
import AssetManagement from './AssetManagement.vue'
import About from './AboutUs.vue'
import FeaturesView from './FeaturesView.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/features',
    name: 'features',
    component: FeaturesView
  },
  {
    path: '/login',
    name: 'Login',
    component: Login 
  },
  // --- MULAI DARI SINI ADALAH HALAMAN YANG DIKUNCI (BUTUH LOGIN) ---
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // Tambahkan ini agar terdeteksi oleh guard
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
    meta: { requiresAuth: true }
  },
  {
    path: '/smart-relief',
    name: 'SmartReliefAllocation',
    component: SmartReliefAllocation,
    meta: { requiresAuth: true }
  },
  {
    path: '/water-sanitation',
    name: 'WaterSanitation',
    component: WaterSanitation,
    meta: { requiresAuth: true }
  },
  {
    path: '/early-warning',
    name: 'EarlyWarningSystem',
    component: EarlyWarningSystem,
    meta: { requiresAuth: true }
  },
  {
    path: '/drone-tracking',
    name: 'DroneTracking',
    component: DroneTracking,
    meta: { requiresAuth: true }
  },
  {
      path: '/asset-management',
      name: 'AssetManagement',
      component: AssetManagement
  }
]

// 1. BUAT ROUTERNYA DULU
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 2. BARU PASANG GUARD-NYA DI SINI
router.beforeEach(async (to, from, next) => {
  // Cek apakah route tujuan memiliki meta requiresAuth
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Ambil sesi user saat ini dari Supabase
  const { data: { session } } = await supabase.auth.getSession()

  if (requiresAuth && !session) {
    next('/login') // Lempar ke login jika belum ada sesi tapi maksa masuk halaman terkunci
  } else if (to.path === '/login' && session) {
    next('/dashboard') // Jika sudah login tapi iseng buka halaman login, lempar ke dashboard
  } else {
    next() // Loloskan
  }
})

export default router