<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Water & Sanitation</h1>
        <p class="text-gray-600">Monitor water quality and sanitation infrastructure status</p>
      </div>

      <!-- Left Panel Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <!-- Layer Control -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">Layer Control</h3>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.disasterZone" class="mr-2">
              <span class="text-red-600 text-lg mr-2">🔺</span>
              <span class="text-gray-700">Disaster Zone</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.areaPriority" class="mr-2">
              <span class="text-yellow-600 text-lg mr-2">📍</span>
              <span class="text-gray-700">Area Priority</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.diseaseSpread" class="mr-2">
              <span class="text-red-700 text-lg mr-2">⚠️</span>
              <span class="text-gray-700">Disease Spread</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.healthFacility" class="mr-2">
              <span class="text-green-600 text-lg mr-2">✚</span>
              <span class="text-gray-700">Health Facility</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.waterSanitization" class="mr-2">
              <span class="text-blue-600 text-lg mr-2">💧</span>
              <span class="text-gray-700">Water & Sanitation</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="layers.report" class="mr-2">
              <span class="text-orange-600 text-lg mr-2">📋</span>
              <span class="text-gray-700">Low Report</span>
            </label>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">System Status</h3>
          <div class="space-y-3 text-sm">
            <div>
              <span class="text-orange-600 font-bold">{{ waterSanitationData.systemStatus.highPriority }}</span>
              <span class="text-gray-700"> High Priority</span>
            </div>
            <div>
              <span class="text-blue-600 font-bold">{{ waterSanitationData.systemStatus.activeDrains }}</span>
              <span class="text-gray-700"> Active Drains</span>
            </div>
            <div>
              <span class="text-green-600 font-bold">{{ waterSanitationData.systemStatus.healthFacilities }}</span>
              <span class="text-gray-700"> Health Facilities</span>
            </div>
            <div>
              <span class="text-blue-600 font-bold">{{ waterSanitationData.systemStatus.waterPoints }}</span>
              <span class="text-gray-700"> Water Points</span>
            </div>
            <div>
              <span class="text-red-600 font-bold">{{ waterSanitationData.systemStatus.lowReport }}</span>
              <span class="text-gray-700"> Low Report</span>
            </div>
          </div>
        </div>

        <!-- Water Quality Info -->
        <div class="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400 lg:col-span-2">
          <h3 class="font-bold text-gray-900 mb-3">Water Quality</h3>
          <p class="text-pink-700 font-semibold mb-3">{{ waterSanitationData.disasterZones[0].waterQuality }}</p>
          <div class="text-sm space-y-2">
            <div><strong>pH Level:</strong> {{ waterSanitationData.waterQualityParams.phLevel.value }}</div>
            <div><strong>Turbidity:</strong> {{ waterSanitationData.waterQualityParams.turbidity.value }}</div>
            <div><strong>Bacteria:</strong> {{ waterSanitationData.waterQualityParams.bacteria.value }}</div>
          </div>
        </div>
      </div>

      <!-- Map and Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Map -->
        <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Water & Sanitation Map</h2>
          <div class="bg-gradient-to-br from-gray-300 to-gray-400 rounded h-96 flex items-center justify-center border-2 border-gray-300">
            <div class="text-center">
              <div class="text-6xl mb-4">🗺️</div>
              <p class="text-gray-700 font-semibold">Indonesia Map</p>
              <p class="text-gray-600 text-sm">Water & Sanitation Status Visualization</p>
              <div class="mt-4 text-left bg-white p-3 rounded inline-block text-sm">
                <div class="font-semibold text-red-600 mb-2">🔺 Critical - Water Use Damage</div>
                <p class="text-gray-700">Point to view: Kab. Garut</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Disaster Zone Details -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-bold text-gray-900 mb-4">Disaster Zone Details</h3>
          <div v-for="zone in waterSanitationData.disasterZones" :key="zone.id" class="space-y-4">
            <div>
              <label class="text-sm text-gray-600">Zone Name</label>
              <p class="font-semibold text-gray-900">{{ zone.name }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Severity</label>
              <span class="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{{ zone.severity }}</span>
            </div>
            <div>
              <label class="text-sm text-gray-600">Operational Status</label>
              <p class="text-orange-600 font-semibold">{{ zone.operationalStatus }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Capacity</label>
              <p class="font-semibold text-gray-900">{{ zone.capacity }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Last Inspection</label>
              <p class="text-gray-700">{{ zone.lastInspection }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning Box -->
      <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div class="flex items-start">
          <span class="text-3xl mr-4">⚠️</span>
          <div>
            <h3 class="font-bold text-red-800 mb-2">Warning</h3>
            <p class="text-red-700">{{ waterSanitationData.disasterZones[0].warning }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { waterSanitationData } from './assets/dummyData'

export default defineComponent({
  name: 'WaterSanitation',
  data() {
    return {
      waterSanitationData,
      layers: {
        disasterZone: true,
        areaPriority: true,
        diseaseSpread: false,
        healthFacility: true,
        waterSanitization: true,
        report: false
      }
    }
  }
})
</script>

<style scoped>
input[type="checkbox"] {
  cursor: pointer;
}
</style>
