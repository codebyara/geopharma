<template>
  <!-- h-screen dan overflow-hidden mengunci halaman agar tidak bisa di-scroll secara global -->
  <div class="bg-gray-50 h-screen font-sans text-gray-800 flex flex-col overflow-hidden">
    
    <!-- flex-1 dan min-h-0 memaksa kontainer ini untuk menyesuaikan tinggi layar -->
    <div class="container mx-auto px-4 max-w-7xl flex flex-col flex-1 py-5 min-h-0">
      
      <!-- Title Area (Fixed) -->
      <div class="mb-4 flex-shrink-0">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">Water & Sanitation Intelligence</h1>
        <p class="text-xs text-gray-500">Pemantauan kualitas air, infrastruktur sanitasi, dan mitigasi penyakit secara real-time.</p>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-full">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <template v-else>
        <!-- Top Panel: System Status (Fixed) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 flex-shrink-0">
          <div class="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg">💧</div>
            <div>
              <div class="text-lg font-bold text-gray-800 leading-none">{{ facilities.length }}</div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Fasilitas Air</div>
            </div>
          </div>
          <div class="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-lg">☣️</div>
            <div>
              <div class="text-lg font-bold text-red-600 leading-none">{{ contaminatedCount }}</div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Tercemar (Kritis)</div>
            </div>
          </div>
          <div class="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-lg">🏜️</div>
            <div>
              <div class="text-lg font-bold text-orange-600 leading-none">{{ droughtCount }}</div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Kekeringan</div>
            </div>
          </div>
          <div class="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-lg">✅</div>
            <div>
              <div class="text-lg font-bold text-green-600 leading-none">{{ safeCount }}</div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Aman Dikonsumsi</div>
            </div>
          </div>
        </div>

        <!-- Main Content Area (Dynamic Height) -->
        <!-- flex-1 membuat area ini mengambil SELURUH sisa ruang di layar -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          <!-- MAP SECTION (Terkunci, mengambil sisa tinggi layar penuh) -->
          <div class="lg:col-span-2 bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex justify-between items-center mb-2 px-1">
              <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span>🗺️</span> Peta Pemantauan Sanitasi
              </h2>
              <div class="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Klik pin untuk detail</div>
            </div>
            <!-- CONTAINER PETA -->
            <div ref="mapContainer" class="w-full flex-1 rounded-lg border border-gray-200 bg-gray-50 z-0"></div>
          </div>

          <!-- DETAILS SECTION (Scrollable) -->
          <!-- h-full dan overflow-y-auto membuat panel ini bisa di-scroll mandiri -->
          <div class="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-2">
            
            <div v-if="!selectedFacility" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col items-center justify-center text-center">
              <span class="text-3xl mb-3 opacity-40">👆</span>
              <h3 class="font-bold text-gray-600 text-sm">Belum Ada Fasilitas Dipilih</h3>
              <p class="text-xs text-gray-400 mt-2 max-w-[200px]">Pilih ikon air di peta untuk memulai inspeksi kualitas.</p>
            </div>

            <template v-else>
              <!-- Water Quality Panel -->
              <div :class="getQualityBgClass(selectedFacility.status)" class="p-4 rounded-xl border shadow-sm transition-all flex-shrink-0">
                <div class="flex justify-between items-start mb-4">
                  <h3 class="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <span>🔬</span> Analisis Kualitas Air
                  </h3>
                  <span :class="getStatusBadgeClass(selectedFacility.status)" class="px-2 py-1 rounded text-[9px] font-bold uppercase shadow-sm">
                    {{ selectedFacility.status }}
                  </span>
                </div>
                
                <div class="space-y-2 text-xs bg-white/60 p-3 rounded-lg border border-white/40">
                  <div class="flex justify-between border-b border-black/5 pb-1.5">
                    <span class="text-gray-500 font-medium">Kapasitas (Debit)</span> 
                    <span class="font-mono font-bold text-gray-800">{{ selectedFacility.capacity_pct }}%</span>
                  </div>
                  <div class="flex flex-col border-b border-black/5 pb-1.5">
                    <span class="text-gray-500 font-medium mb-1">Kondisi Sanitasi</span> 
                    <span class="text-gray-700 leading-relaxed">
                      {{ selectedFacility.sanitation_condition || 'Dalam batas normal' }}
                    </span>
                  </div>
                  <div class="flex justify-between pt-0.5">
                    <span class="text-gray-500 font-medium">Kekeringan Ekstrem</span> 
                    <span :class="selectedFacility.is_drought === 'true' || selectedFacility.is_drought === true ? 'text-red-600 font-bold' : 'text-green-600 font-medium'">
                      {{ selectedFacility.is_drought === 'true' || selectedFacility.is_drought === true ? 'YA (Kritis)' : 'TIDAK' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Facility Details Panel -->
              <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <h3 class="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <span>📋</span> Detail Infrastruktur
                </h3>
                <div class="space-y-3">
                  <div>
                    <label class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Nama Fasilitas</label>
                    <p class="font-semibold text-gray-800 text-sm mt-0.5">{{ selectedFacility.name }}</p>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tipe Fasilitas</label>
                      <p class="font-medium text-gray-700 text-xs mt-0.5 capitalize">{{ selectedFacility.facility_type.replace('_', ' ') }}</p>
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Terakhir Update</label>
                      <p class="text-[11px] text-gray-600 font-mono mt-0.5">{{ formatDate(selectedFacility.created_at) }}</p>
                    </div>
                  </div>
                  
                  <!-- Minimalist Warning Box -->
                  <div v-if="selectedFacility.status === 'contaminated' || selectedFacility.is_drought === 'true' || selectedFacility.is_drought === true" class="mt-4 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2.5">
                    <span class="text-base leading-none">⚠️</span>
                    <div>
                      <h4 class="font-bold text-red-800 text-[10px] uppercase tracking-wide mb-0.5">Peringatan Kritis</h4>
                      <p class="text-[10px] text-red-700 leading-relaxed">
                        {{ selectedFacility.status === 'contaminated' 
                          ? 'Air terkontaminasi patogen berbahaya. Distribusikan air galon dan laporkan ke sistem Early Warning.' 
                          : 'Sumber air mengering total. Butuh suplai armada tangki air bersih segera.' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </template>

          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from './services/supabase.js'

export default defineComponent({
  name: 'WaterSanitation',
  data() {
    return {
      isLoading: true,
      facilities: [],
      selectedFacility: null,
      mapInstance: null,
      markers: []
    }
  },
  computed: {
    contaminatedCount() { return this.facilities.filter(f => f.status === 'contaminated').length; },
    droughtCount() { return this.facilities.filter(f => f.is_drought === 'true' || f.is_drought === true || f.status === 'empty').length; },
    safeCount() { return this.facilities.filter(f => f.status === 'safe' || f.status === 'treated').length; }
  },
  async mounted() {
    await this.fetchData();
    this.$nextTick(() => {
      setTimeout(() => {
        this.initMap();
      }, 100);
    });
  },
  beforeUnmount() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        const { data, error } = await supabase.from('water_sanitation').select('*');
        if (error) throw error;
        this.facilities = data || [];
      } catch (err) {
        console.error("Gagal menarik data water_sanitation:", err);
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    getQualityBgClass(status) {
      if (status === 'contaminated') return 'bg-red-50 border-red-100 text-red-900';
      if (status === 'empty' || status === 'warning') return 'bg-orange-50 border-orange-100 text-orange-900';
      return 'bg-blue-50 border-blue-100 text-blue-900';
    },

    getStatusBadgeClass(status) {
      if (status === 'contaminated') return 'bg-red-500 text-white border border-red-600';
      if (status === 'empty') return 'bg-orange-500 text-white border border-orange-600';
      return 'bg-green-500 text-white border border-green-600';
    },

   async initMap() {
      const container = this.$refs.mapContainer;
      if (!container) return;

      if (!window.L) {
        await new Promise((resolve) => {
          const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
          const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = resolve; document.head.appendChild(script);
        });
      }

      this.mapInstance = window.L.map(container, {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: true,
        attributionControl: false
      });

      // 🌍 BAGIAN INI YANG DIUBAH: Menggunakan standar OpenStreetMap agar warnanya sama persis dengan Dashboard
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.mapInstance);

      // Global Reset Button
      const ResetControl = window.L.Control.extend({
        options: { position: 'topleft' },
        onAdd: (map) => {
          const btnContainer = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const resetBtn = window.L.DomUtil.create('a', 'leaflet-control-reset', btnContainer);
          resetBtn.innerHTML = '🌍';
          resetBtn.href = '#';
          resetBtn.title = 'Reset Peta (Indonesia)';
          resetBtn.style.fontSize = '16px';
          resetBtn.style.lineHeight = '30px';
          resetBtn.style.textAlign = 'center';
          resetBtn.style.textDecoration = 'none';
          resetBtn.style.backgroundColor = '#fff';

          window.L.DomEvent.on(resetBtn, 'click', (e) => {
            window.L.DomEvent.stopPropagation(e);
            window.L.DomEvent.preventDefault(e);
            map.flyTo([-2.5, 118.0], 5, { duration: 1.5 });
          });
          return btnContainer;
        }
      });
      this.mapInstance.addControl(new ResetControl());

      // Markers
      this.facilities.forEach(facility => {
        if (facility.latitude && facility.longitude) {
          
          let markerColor = '#3b82f6';
          let iconSymbol = '💧';
          
          if (facility.status === 'contaminated') {
            markerColor = '#ef4444';
            iconSymbol = '☣️';
          } else if (facility.is_drought === 'true' || facility.is_drought === true || facility.status === 'empty') {
            markerColor = '#f97316';
            iconSymbol = '🏜️';
          }

          const customIcon = window.L.divIcon({
            className: '',
            html: `<div style="width:26px;height:26px;background:${markerColor};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.15);font-size:12px;cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${iconSymbol}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const marker = window.L.marker([facility.latitude, facility.longitude], { icon: customIcon })
            .addTo(this.mapInstance);

          marker.on('click', () => {
            this.selectedFacility = facility;
            this.mapInstance.flyTo([facility.latitude, facility.longitude], 10, {
              duration: 1.5
            });
          });

          marker.bindTooltip(`<div style="font-family:sans-serif;text-align:center;"><b>${facility.name}</b><br><span style="color:#666;font-size:10px;">Kapasitas: ${facility.capacity_pct}%</span></div>`, {
            direction: 'top',
            offset: [0, -10]
          });

          this.markers.push(marker);
        }
      });
    }
  }
})
</script>

<style scoped>
.leaflet-container {
  z-index: 1;
  border-radius: 0.5rem;
}
.leaflet-control-reset:hover {
  background-color: #f4f4f4 !important;
}

/* Custom Minimalist Scrollbar untuk Sidebar Kanan */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>