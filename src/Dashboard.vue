<template>
  <div class="dashboard-page">
    <!-- Map Container -->
    <section class="relative min-h-screen py-6">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Sidebar -->
          <aside class="col-span-12 lg:col-span-2 bg-white shadow-sm rounded-lg p-6 overflow-y-auto border">
            <h2 class="text-2xl font-bold text-primary mb-6">Auto Priority Zoning</h2>
            
            <!-- Layer Control -->
            <div class="mb-8">
              <h3 class="font-bold text-gray-700 mb-4">Layer Control</h3>
              <div class="space-y-3">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" v-model="layers.disasterZone" class="w-4 h-4">
                  <span class="text-sm">🚨 Disaster Zone</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" v-model="layers.areaPriority" class="w-4 h-4">
                  <span class="text-sm">⭐ Area Priority</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" v-model="layers.diseaseSpread" class="w-4 h-4">
                  <span class="text-sm">🦠 Disease Spread</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" v-model="layers.healthFacility" class="w-4 h-4">
                  <span class="text-sm">🏥 Health Facility</span>
                </label>
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" v-model="layers.waterSanitation" class="w-4 h-4">
                  <span class="text-sm">💧 Water & Sanitation</span>
                </label>
              </div>
            </div>

            <!-- System Status -->
            <div class="bg-gray-50 rounded-lg p-4 border">
              <h3 class="font-bold text-gray-700 mb-3">System Status</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-red-600 font-semibold">High Priority Zone</span>
                  <span class="font-bold">7</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-blue-600 font-semibold">Active Drones</span>
                  <span class="font-bold">4</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-green-600 font-semibold">Health Facilities</span>
                  <span class="font-bold">50</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-600 font-semibold">Report (24 hours)</span>
                  <span class="font-bold">10</span>
                </div>
              </div>
            </div>
          </aside>

          <!-- Map Area -->
          <div class="col-span-12 lg:col-span-7 bg-gray-100 relative rounded-lg overflow-hidden min-h-[60vh]">
            <div id="map" class="w-full h-[70vh]"></div>
            
            <!-- Location Details Popup -->
            <div v-if="selectedLocation" class="absolute top-6 left-6 bg-white rounded-lg shadow-xl p-6 w-80 z-20">
              <button @click="selectedLocation = null" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
              <h3 class="text-xl font-bold text-primary mb-4">{{ selectedLocation.name }}</h3>
              
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-gray-500">Location</p>
                  <p class="font-semibold">{{ selectedLocation.location }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Disaster Type</p>
                  <p class="font-semibold text-danger">{{ selectedLocation.type }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Affected Victims</p>
                  <p class="font-semibold">{{ selectedLocation.victims }} people</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Priority Level</p>
                  <p class="font-semibold text-warning">{{ selectedLocation.priority }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Medical Needs</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span v-for="need in selectedLocation.medicalNeeds" :key="need" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      🏥 {{ need }}
                    </span>
                  </div>
                </div>
              </div>
              
              <button class="btn-accent w-full mt-6">See Details</button>
            </div>
          </div>

          <!-- Right Panel - Report Statistics -->
          <aside class="hidden lg:block col-span-12 lg:col-span-3 self-start">
            <div class="bg-white shadow-sm rounded-lg p-6 overflow-y-auto" style="max-height: calc(100vh - 6rem);">
              <h2 class="text-2xl font-bold text-primary mb-6">Report Statistics</h2>
              
              <div class="space-y-4">
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Total Reports</p>
                  <p class="text-3xl font-bold text-blue-600">{{ formatNumber(reportStats.total) }}</p>
                  <p class="text-xs text-gray-500">This month</p>
                </div>

                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Verified Reports</p>
                  <p class="text-3xl font-bold text-green-600">{{ formatNumber(reportStats.verified) }}</p>
                  <p class="text-xs text-gray-500">71% verification rate</p>
                </div>

                <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <p class="text-xs text-gray-600">Pending Review</p>
                  <p class="text-3xl font-bold text-orange-600">{{ formatNumber(reportStats.pending) }}</p>
                  <p class="text-xs text-gray-500">Awaiting verification</p>
                </div>
              </div>

              <div class="mt-6 border-t pt-6">
                <h3 class="font-bold text-gray-700 mb-4">Submit Field Report</h3>

                <div class="border rounded-lg p-4 mb-4 text-center text-gray-500 bg-gray-50">
                  <div class="mb-3">Click to upload or drag and drop</div>
                  <button class="btn-outline px-4 py-2 rounded bg-white border">Choose File</button>
                </div>

                <div class="space-y-3">
                  <input placeholder="Location" class="w-full border rounded px-3 py-2 text-sm" />
                  <input placeholder="Victim Count" class="w-full border rounded px-3 py-2 text-sm" />
                  <select class="w-full border rounded px-3 py-2 text-sm">
                    <option>Flood</option>
                    <option>Landslide</option>
                    <option>Earthquake</option>
                  </select>
                  <textarea placeholder="Medical Needs" class="w-full border rounded px-3 py-2 text-sm" rows="3"></textarea>
                  <button class="btn-accent w-full px-4 py-2 rounded text-white">Submit Report</button>
                </div>
              </div>

              <div class="mt-6 border-t pt-6">
                <h3 class="font-bold text-gray-700 mb-4">Recent Reports</h3>
                <div class="space-y-3">
                  <div v-for="report in recentReports" :key="report.id" class="border rounded-lg p-3 hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-2">
                      <span class="font-semibold text-sm text-gray-800">{{ report.type }}</span>
                      <span class="text-xs px-2 py-1 rounded" :class="report.statusClass">{{ report.status }}</span>
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
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Dashboard',
  data() {
    return {
      layers: {
        disasterZone: true,
        areaPriority: true,
        diseaseSpread: false,
        healthFacility: true,
        waterSanitation: false
      },
      selectedLocation: null,
      recentReports: [
        {
          id: 1,
          type: 'Flood',
          location: 'Jakarta Barat',
          status: 'Critical',
          statusClass: 'bg-red-100 text-red-700',
          time: '2 hours ago'
        },
        {
          id: 2,
          type: 'Landslide',
          location: 'Bandung Utara',
          status: 'High',
          statusClass: 'bg-orange-100 text-orange-700',
          time: '4 hours ago'
        },
        {
          id: 3,
          type: 'Flash Flood',
          location: 'Bekasi',
          status: 'Medium',
          statusClass: 'bg-yellow-100 text-yellow-700',
          time: '6 hours ago'
        }
      ],
      disasterLocations: [
        {
          lat: -6.1751,
          lng: 106.8650,
          name: 'Jakarta Barat',
          location: 'Coordinates: -6.1751, 106.8650',
          type: 'Flood',
          victims: 342,
          priority: 'High',
          medicalNeeds: ['Antibiotics', 'Clean Water', 'First Aid Kits']
        },
        {
          lat: -6.9175,
          lng: 107.6191,
          name: 'Bandung Utara',
          location: 'Coordinates: -6.9175, 107.6191',
          type: 'Landslide',
          victims: 128,
          priority: 'High',
          medicalNeeds: ['Bandages', 'Pain Relief', 'Oxygen']
        }
      ]
      ,
      reportStats: {
        total: 1247,
        verified: 892,
        pending: 45
      }
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      const L = window.L || this.loadLeaflet()
      if (!L) return

      const map = L.map('map').setView([-0.7893, 113.9213], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Add markers for disaster locations
      this.disasterLocations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], {
          icon: L.divIcon({
            html: '🚨',
            iconSize: [32, 32]
          })
        }).addTo(map)

        marker.on('click', () => {
          this.selectedLocation = loc
        })
      })
    },
    loadLeaflet() {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      document.head.appendChild(script)

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      return null
    }
    ,
    formatNumber(n) {
      try {
        return Number(n).toLocaleString()
      } catch (e) {
        return n
      }
    }
  }
})
</script>

<style scoped>
#map {
  background-color: #e0e0e0;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
</style>
