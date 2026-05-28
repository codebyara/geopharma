<template>
  <div class="dashboard-page">
    <section class="relative min-h-screen py-6">
      <div class="container mx-auto px-4">

        <!-- Loading Overlay -->
        <div v-if="store.isLoading && !store.hasData"
          class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p class="text-gray-700 font-semibold">Mengambil data bencana...</p>
            <p class="text-xs text-gray-400">Sumber: PetaBencana.id</p>
          </div>
        </div>

        <!-- Error Banner -->
        <div v-if="store.error"
          class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span class="text-red-500 text-xl">⚠️</span>
          <div>
            <p class="text-sm font-semibold text-red-700">Gagal memuat data API</p>
            <p class="text-xs text-red-500">{{ store.error }}</p>
          </div>
          <button @click="store.fetchAll()"
            class="ml-auto text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition">
            Coba Lagi
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- ── Left Sidebar ─────────────────────────────────────────────── -->
          <aside class="col-span-12 lg:col-span-2 bg-white shadow-sm rounded-lg p-6 overflow-y-auto border">
            <h2 class="text-2xl font-bold text-primary mb-6">Auto Priority Zoning</h2>

            <!-- Region Selector -->
            <div class="mb-6">
              <h3 class="font-bold text-gray-700 mb-2 text-sm">Pilih Wilayah</h3>
              <select
                v-model="selectedRegionKey"
                @change="onRegionChange"
                class="w-full border rounded px-3 py-2 text-sm bg-white">
                <option v-for="(code, key) in REGION_CODES" :key="key" :value="key">
                  {{ regionLabel(key) }}
                </option>
              </select>
            </div>

            <!-- Layer Control -->
            <div class="mb-8">
              <h3 class="font-bold text-gray-700 mb-4">Layer Control</h3>
              <div class="space-y-3">
                <label v-for="(active, key) in store.layers" :key="key"
                  class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox"
                    :checked="active"
                    @change="store.toggleLayer(key)"
                    class="w-4 h-4">
                  <span class="text-sm">{{ layerLabel(key) }}</span>
                </label>
              </div>
            </div>

            <!-- Disaster Type Filter -->
            <div class="mb-6">
              <h3 class="font-bold text-gray-700 mb-2 text-sm">Filter Bencana</h3>
              <select
                v-model="selectedDisasterType"
                @change="store.changeDisasterType(selectedDisasterType)"
                class="w-full border rounded px-3 py-2 text-sm bg-white">
                <option :value="null">Semua Tipe</option>
                <option value="flood">🌊 Banjir</option>
                <option value="earthquake">🌍 Gempa</option>
                <option value="wind">🌪️ Angin</option>
                <option value="haze">🌫️ Kabut Asap</option>
                <option value="volcano">🌋 Gunung Api</option>
                <option value="fire">🔥 Kebakaran</option>
              </select>
            </div>

            <!-- System Status -->
            <div class="bg-gray-50 rounded-lg p-4 border">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-gray-700">System Status</h3>
                <!-- Indikator auto-refresh -->
                <span class="flex items-center gap-1 text-xs text-green-600">
                  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-red-600 font-semibold">High Priority Zone</span>
                  <span class="font-bold">{{ store.highPriorityCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-600 font-semibold">Active Drones</span>
                  <span class="font-bold">4</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600 font-semibold">Health Facilities</span>
                  <span class="font-bold">{{ store.infrastructure.length || 50 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-600 font-semibold">Report (1 jam)</span>
                  <span class="font-bold">{{ store.reports.length }}</span>
                </div>
              </div>
              <p v-if="store.lastUpdated" class="text-xs text-gray-400 mt-3">
                Update: {{ formatTime(store.lastUpdated) }}
              </p>
            </div>
          </aside>

          <!-- ── Map Area ──────────────────────────────────────────────────── -->
          <div class="col-span-12 lg:col-span-7 bg-gray-100 relative rounded-lg overflow-hidden min-h-[60vh]">
            <div id="map" class="w-full h-[70vh]"></div>

            <!-- Map Loading Spinner (saat refresh data) -->
            <div v-if="store.isLoading && store.hasData"
              class="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-20">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            </div>

            <!-- Location Details Popup -->
            <div v-if="selectedLocation"
              class="absolute top-6 left-6 bg-white rounded-lg shadow-xl p-6 w-80 z-20">
              <button @click="selectedLocation = null"
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">✕</button>
              <h3 class="text-xl font-bold text-primary mb-4">
                {{ selectedLocation.typeLabel }}
              </h3>
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-gray-500">Lokasi</p>
                  <p class="font-semibold">{{ selectedLocation.location }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Tipe Bencana</p>
                  <p class="font-semibold text-danger">{{ selectedLocation.icon }} {{ selectedLocation.typeLabel }}</p>
                </div>
                <div v-if="selectedLocation.text">
                  <p class="text-xs text-gray-500">Keterangan</p>
                  <p class="text-sm text-gray-700">{{ selectedLocation.text }}</p>
                </div>
                <div v-if="selectedLocation.createdAt">
                  <p class="text-xs text-gray-500">Dilaporkan</p>
                  <p class="font-semibold text-sm">{{ timeAgo(selectedLocation.createdAt) }}</p>
                </div>
                <div v-if="selectedLocation.imageUrl">
                  <img :src="selectedLocation.imageUrl" alt="Foto laporan"
                    class="w-full rounded-lg mt-2 object-cover max-h-32">
                </div>
              </div>
              <a v-if="selectedLocation.imageUrl"
                :href="selectedLocation.imageUrl" target="_blank"
                class="btn-accent w-full mt-4 block text-center text-sm py-2 rounded">
                Lihat Foto
              </a>
            </div>
          </div>

          <!-- ── Right Panel ───────────────────────────────────────────────── -->
          <aside class="hidden lg:block col-span-12 lg:col-span-3 self-start">
            <div class="bg-white shadow-sm rounded-lg p-6 overflow-y-auto" style="max-height: calc(100vh - 6rem);">
              <h2 class="text-2xl font-bold text-primary mb-6">Report Statistics</h2>

              <!-- Stats Cards -->
              <div class="space-y-4">
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Total Laporan</p>
                  <p class="text-3xl font-bold text-blue-600">{{ formatNumber(store.reportStats.total) }}</p>
                  <p class="text-xs text-gray-500">1 jam terakhir · {{ store.selectedRegion }}</p>
                </div>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Dengan Foto</p>
                  <p class="text-3xl font-bold text-green-600">{{ formatNumber(store.reportStats.verified) }}</p>
                  <p class="text-xs text-gray-500">{{ store.reportStats.verificationRate }}% dari total laporan</p>
                </div>
                <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Tanpa Foto</p>
                  <p class="text-3xl font-bold text-orange-600">{{ formatNumber(store.reportStats.pending) }}</p>
                  <p class="text-xs text-gray-500">Perlu verifikasi lapangan</p>
                </div>
              </div>

              <!-- Submit Field Report -->
              <div class="mt-6 border-t pt-6">
                <h3 class="font-bold text-gray-700 mb-4">Submit Field Report</h3>
                <div class="border rounded-lg p-4 mb-4 text-center text-gray-500 bg-gray-50">
                  <div class="mb-3 text-sm">Klik untuk upload atau drag & drop</div>
                  <button class="btn-outline px-4 py-2 rounded bg-white border text-sm">Pilih File</button>
                </div>
                <div class="space-y-3">
                  <input placeholder="Lokasi kejadian" class="w-full border rounded px-3 py-2 text-sm" />
                  <input placeholder="Jumlah korban" type="number" class="w-full border rounded px-3 py-2 text-sm" />
                  <select class="w-full border rounded px-3 py-2 text-sm">
                    <option value="flood">Banjir</option>
                    <option value="earthquake">Gempa</option>
                    <option value="wind">Angin Kencang</option>
                    <option value="haze">Kabut Asap</option>
                    <option value="volcano">Gunung Api</option>
                    <option value="fire">Kebakaran</option>
                  </select>
                  <textarea placeholder="Kebutuhan medis / keterangan tambahan"
                    class="w-full border rounded px-3 py-2 text-sm" rows="3"></textarea>
                  <button class="btn-accent w-full px-4 py-2 rounded text-white text-sm">
                    Kirim Laporan
                  </button>
                </div>
              </div>

              <!-- Recent Reports dari API -->
              <div class="mt-6 border-t pt-6">
                <h3 class="font-bold text-gray-700 mb-4">
                  Laporan Terbaru
                  <span class="text-xs font-normal text-gray-400 ml-1">(Live)</span>
                </h3>

                <!-- Skeleton saat loading pertama kali -->
                <div v-if="store.isLoading && !store.hasData" class="space-y-3">
                  <div v-for="i in 3" :key="i" class="border rounded-lg p-3 animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-else-if="!store.recentReports.length"
                  class="text-center py-8 text-gray-400">
                  <p class="text-3xl mb-2">📭</p>
                  <p class="text-sm">Tidak ada laporan dalam 1 jam terakhir</p>
                  <p class="text-xs mt-1">untuk wilayah {{ store.selectedRegion }}</p>
                </div>

                <!-- List laporan -->
                <div v-else class="space-y-3">
                  <div v-for="report in store.recentReports" :key="report.id"
                    class="border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                    @click="onReportClick(report)">
                    <div class="flex justify-between items-start mb-2">
                      <span class="font-semibold text-sm text-gray-800">{{ report.type }}</span>
                      <span class="text-xs px-2 py-1 rounded" :class="report.statusClass">
                        {{ report.status }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600">{{ report.location }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ report.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { useDisasterStore } from '@/stores/disaster.store'
import { REGION_CODES, DISASTER_CONFIG } from '@/services/petabencana.service'

export default defineComponent({
  name: 'Dashboard',

  setup() {
    const store = useDisasterStore()
    const selectedLocation = ref(null)
    const selectedRegionKey = ref('jakarta')
    const selectedDisasterType = ref(null)

    let mapInstance = null
    let markersLayer = null
    let floodLayer = null
    let infraLayer = null

    // ── Inisialisasi peta Leaflet ─────────────────────────────────────────
    function initMap() {
      const L = window.L
      if (!L || mapInstance) return

      mapInstance = L.map('map').setView([-6.2, 106.8], 10)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Data: PetaBencana.id',
        maxZoom: 19
      }).addTo(mapInstance)

      markersLayer = L.layerGroup().addTo(mapInstance)
      floodLayer   = L.layerGroup().addTo(mapInstance)
      infraLayer   = L.layerGroup().addTo(mapInstance)
    }

    // ── Render markers laporan bencana ────────────────────────────────────
    function renderReportMarkers(reports) {
      if (!markersLayer || !window.L) return
      markersLayer.clearLayers()

      const L = window.L
      reports.forEach((report) => {
        if (!report.lat || !report.lng) return

        const marker = L.marker([report.lat, report.lng], {
          icon: L.divIcon({
            html: `<div style="
              font-size: 24px;
              filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));
              cursor: pointer;
            ">${report.icon}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            className: ''
          })
        })

        marker.bindTooltip(report.popupLabel, { direction: 'top', offset: [0, -30] })
        marker.on('click', () => { selectedLocation.value = report })
        marker.addTo(markersLayer)
      })
    }

    // ── Render flood area polygons ────────────────────────────────────────
    function renderFloodAreas(areas) {
      if (!floodLayer || !window.L) return
      floodLayer.clearLayers()
      if (!store.layers.disasterZone) return

      const L = window.L
      areas.forEach((area) => {
        if (!area.geometry) return
        L.geoJSON(area.geometry, {
          style: {
            color: area.color,
            fillColor: area.color,
            fillOpacity: 0.4,
            weight: 2
          }
        })
        .bindTooltip(`${area.areaName} — ${area.stateLabel}`, { sticky: true })
        .addTo(floodLayer)
      })
    }

    // ── Render infrastructure markers ─────────────────────────────────────
    function renderInfrastructure(facilities) {
      if (!infraLayer || !window.L) return
      infraLayer.clearLayers()
      if (!store.layers.healthFacility) return

      const L = window.L
      facilities.forEach((fac) => {
        if (!fac.lat || !fac.lng) return
        L.marker([fac.lat, fac.lng], {
          icon: L.divIcon({
            html: '<div style="font-size:20px">🏥</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            className: ''
          })
        })
        .bindTooltip(fac.name || 'Fasilitas Kesehatan', { direction: 'top' })
        .addTo(infraLayer)
      })
    }

    // ── Watch perubahan data → update peta ───────────────────────────────
    watch(() => store.formattedReports, (reports) => {
      renderReportMarkers(reports)
    })
    watch(() => store.formattedFloodAreas, (areas) => {
      renderFloodAreas(areas)
    })
    watch(() => store.formattedInfrastructure, (facilities) => {
      renderInfrastructure(facilities)
    })

    // ── Event handlers ────────────────────────────────────────────────────
    function onRegionChange() {
      const code = REGION_CODES[selectedRegionKey.value]
      store.changeRegion(code)
      // Pindahkan view peta ke pusat Indonesia jika tidak ada koordinat spesifik
      if (mapInstance) {
        const regionCenters = {
          jakarta:        [-6.2,  106.8],
          jawa_barat:     [-6.9,  107.6],
          jawa_tengah:    [-7.1,  110.4],
          jawa_timur:     [-7.5,  112.2],
          yogyakarta:     [-7.8,  110.4],
          banten:         [-6.4,  106.1],
          sumatera_barat: [-0.9,  100.4],
          sulawesi_sel:   [-5.1,  119.4],
        }
        const center = regionCenters[selectedRegionKey.value] || [-6.2, 106.8]
        mapInstance.setView(center, 10)
      }
    }

    function onReportClick(report) {
      const found = store.formattedReports.find(r => r.id === report.id)
      if (found) {
        selectedLocation.value = found
        if (mapInstance && found.lat && found.lng) {
          mapInstance.setView([found.lat, found.lng], 14)
        }
      }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────
    onMounted(async () => {
      // Load Leaflet jika belum ada
      if (!window.L) {
        await loadLeaflet()
      }
      initMap()

      // Fetch data dari API
      await store.fetchAll()

      // Render data ke peta
      renderReportMarkers(store.formattedReports)
      renderFloodAreas(store.formattedFloodAreas)
      renderInfrastructure(store.formattedInfrastructure)

      // Mulai auto-refresh
      store.startAutoRefresh()
    })

    onUnmounted(() => {
      store.stopAutoRefresh()
      if (mapInstance) {
        mapInstance.remove()
        mapInstance = null
      }
    })

    function loadLeaflet() {
      return new Promise((resolve) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = resolve
        document.head.appendChild(script)
      })
    }

    // ── Utility ───────────────────────────────────────────────────────────
    function formatNumber(n) {
      return Number(n || 0).toLocaleString('id-ID')
    }

    function formatTime(date) {
      return date ? new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
    }

    function timeAgo(date) {
      if (!date) return ''
      const seconds = Math.floor((new Date() - date) / 1000)
      if (seconds < 60)   return 'Baru saja'
      if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`
      return `${Math.floor(seconds / 86400)} hari lalu`
    }

    function layerLabel(key) {
      const labels = {
        disasterZone:   '🚨 Disaster Zone',
        areaPriority:   '⭐ Area Priority',
        diseaseSpread:  '🦠 Disease Spread',
        healthFacility: '🏥 Health Facility',
        waterSanitation:'💧 Water & Sanitation',
      }
      return labels[key] || key
    }

    function regionLabel(key) {
      const labels = {
        jakarta:        'DKI Jakarta',
        jawa_barat:     'Jawa Barat',
        jawa_tengah:    'Jawa Tengah',
        jawa_timur:     'Jawa Timur',
        yogyakarta:     'DI Yogyakarta',
        banten:         'Banten',
        sumatera_barat: 'Sumatera Barat',
        sulawesi_sel:   'Sulawesi Selatan',
      }
      return labels[key] || key
    }

    return {
      store,
      selectedLocation,
      selectedRegionKey,
      selectedDisasterType,
      REGION_CODES,
      DISASTER_CONFIG,
      onRegionChange,
      onReportClick,
      formatNumber,
      formatTime,
      timeAgo,
      layerLabel,
      regionLabel,
    }
  }
})
</script>

<style scoped>
#map {
  background-color: #e8f4f8;
  min-height: 500px;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
</style>