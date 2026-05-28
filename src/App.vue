<template>
  <div id="app" class="bg-background text-on-surface font-body-md overflow-x-hidden">
    
    <!-- Sembunyikan Header jika berada di halaman Login -->
    <Header v-if="$route.name !== 'Login'" />

    <main>
      <RouterView />
    </main>

    <!-- Sembunyikan Footer jika berada di halaman Login -->
    <footer v-if="$route.name !== 'Login'" class="bg-on-surface border-t border-outline-variant">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter px-margin-desktop py-section-gap w-full max-w-max-width mx-auto">
        <div class="flex flex-col gap-6">
          <div class="font-display-lg text-on-tertiary-container">GEO-PHARMA</div>
          <p class="font-body-md text-surface-variant/70">
            Geo-Pharma is a web-based digital platform designed to integrate spatial disaster analysis with health management systems and pharmaceutical logistics to support mitigation and health response to disasters in Indonesia.
          </p>
          <div class="flex gap-4">
            <span class="material-symbols-outlined text-surface-variant/70 hover:text-secondary-fixed transition-colors cursor-pointer">language</span>
            <span class="material-symbols-outlined text-surface-variant/70 hover:text-secondary-fixed transition-colors cursor-pointer">hub</span>
            <span class="material-symbols-outlined text-surface-variant/70 hover:text-secondary-fixed transition-colors cursor-pointer">public</span>
          </div>
        </div>
        <div class="flex flex-col gap-8">
          <div>
            <h3 class="font-label-caps text-label-caps text-surface mb-4">Mission Directives</h3>
            <ul class="flex flex-col gap-3">
              <li><a class="font-body-md text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Emergency Protocol</a></li>
              <li><a class="font-body-md text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a></li>
              <li><a class="font-body-md text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Contact Support</a></li>
              <li><a class="font-body-md text-surface-variant/70 hover:text-secondary-fixed transition-colors" href="#">Mission Statement</a></li>
            </ul>
          </div>
        </div>
        <div class="flex flex-col gap-8">
          <div>
            <h3 class="font-label-caps text-label-caps text-surface mb-4">Regional Hubs</h3>
            <ul class="flex flex-col gap-3 font-body-md text-surface-variant/70">
              <li>Jakarta HQ - Lvl 12 Command</li>
              <li>Surabaya Response Sector</li>
              <li>Medan Logistics Node</li>
              <li>Makassar Field Dispatch</li>
            </ul>
          </div>
          <div class="mt-4">
            <div class="font-label-caps text-[10px] text-secondary-container mb-2">SYSTEM STATUS: ONLINE</div>
            <div class="flex gap-1">
              <div class="w-4 h-1 bg-secondary-container"></div>
              <div class="w-4 h-1 bg-secondary-container"></div>
              <div class="w-4 h-1 bg-secondary-container"></div>
              <div class="w-4 h-1 bg-outline-variant"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-outline-variant/20 px-margin-desktop py-6">
        <div class="max-w-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="font-label-caps text-[10px] text-surface-variant/50">© 2024 National Disaster Intelligence Agency. Classified - Internal Use Only.</p>
          <div class="font-label-caps text-[10px] text-surface-variant/50 flex gap-6">
            <span>V2.4.0-STABLE</span>
            <span>ENC: AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import Header from './Header.vue'
import { supabase } from './services/supabase' // Pastikan path ini benar
import { useAuthStore } from './stores/auth'     // Pastikan path ini benar

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
    Header
  },
  created() {
    // Sinkronisasi status login Supabase dengan Pinia Store secara otomatis
    const authStore = useAuthStore()

    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        authStore.login({
          name: session.user.email,
          initials: session.user.email.substring(0, 2).toUpperCase(),
          role: 'Admin'
        })
      } else {
        authStore.logout()
      }
    })
  },
  mounted() {
    // Simple micro-interactions
    document.querySelectorAll('.intelligence-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = '#00450d';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '#c0c9bb';
      });
    });
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
  font-family: 'Material Symbols Outlined';
}

.intelligence-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.intelligence-card:hover {
  transform: translateY(-4px);
}

.glass-panel {
  background: rgba(248, 250, 248, 0.8);
  backdrop-filter: blur(10px);
}
</style>