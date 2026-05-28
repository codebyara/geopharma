<template>
  <footer class="bg-surface-container-high border-t border-outline-variant py-12">
    <div class="container mx-auto px-margin-mobile md:px-margin-desktop">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 class="text-headline-lg font-sora text-primary mb-4">🌍 GEO-PHARMA</h3>
          <p class="text-on-surface-variant text-body-md font-mono">Indonesia's First Geo-Pharmaceutical Disaster Intelligence Platform</p>
        </div>
        <div>
          <h4 class="font-bold mb-4 text-on-surface font-sora">Misi Strategis</h4>
          <ul class="space-y-2 text-on-surface-variant text-body-md font-mono">
            <li><RouterLink to="/dashboard" class="hover:text-primary transition">Emergency Protocol</RouterLink></li>
            <li><RouterLink to="/report" class="hover:text-primary transition">Jakarta iD - Lvl 12 Command</RouterLink></li>
            <li><a href="#" class="hover:text-primary transition">Supplier Response Sector</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4 text-on-surface font-sora">Sumber Daya</h4>
          <ul class="space-y-2 text-on-surface-variant text-body-md font-mono">
            <li><a href="#" class="hover:text-primary transition">Dokumentasi</a></li>
            <li><a href="#" class="hover:text-primary transition">FAQ</a></li>
            <li><a href="#" class="hover:text-primary transition">Hubungi Kami</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4 text-on-surface font-sora">Legal</h4>
          <ul class="space-y-2 text-on-surface-variant text-body-md font-mono">
            <li><a href="#" class="hover:text-primary transition">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-primary transition">Terms & Conditions</a></li>
            <li><a href="#" class="hover:text-primary transition">Mission Statement</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-outline-variant pt-8 text-center text-on-surface-variant text-label-caps font-mono">
        <p>&copy; 2024 National Disaster Intelligence Agency. Classified - Internal Use Only. | Version 1.0.4 - STABLE | EMS: API-2025</p>
      </div>\n    </div>\n  </footer>
</template>

<script>
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'Footer',
  components: { RouterLink }
})
</script>
